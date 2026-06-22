import { PrismaClient } from "@prisma/client";
import { buildSchedule } from "../src/common/amortization";

const prisma = new PrismaClient();

const products = [
  { productCode: "standard_rental", nameEn: "Standard Rental Financing", descriptionEn: "Spread your annual rent into monthly installments.", baseApr: 18.0, maxAmount: 150000, minAmount: 10000, availableTerms: [6, 9, 18, 24], displayOrder: 1 },
  { productCode: "premium_rental", nameEn: "Premium Rental Financing", descriptionEn: "Premium financing for premium properties.", baseApr: 16.0, maxAmount: 200000, minAmount: 10000, availableTerms: [12, 18, 24, 36], displayOrder: 2 },
  { productCode: "express_personal", nameEn: "Express Personal Loan", descriptionEn: "Fast disbursement for urgent cash needs.", baseApr: 21.0, maxAmount: 50000, minAmount: 1000, availableTerms: [6, 9, 12, 18, 24], displayOrder: 3 },
  { productCode: "flexible_personal", nameEn: "Flexible Personal Loan", descriptionEn: "Flexible terms tailored to the borrower.", baseApr: 19.5, maxAmount: 100000, minAmount: 1000, availableTerms: [6, 9, 12, 18, 24, 36], displayOrder: 4 },
];

const sandboxConfig = [
  { key: "max_users", value: "100", description: "Max sandbox users (DFSA ITL)" },
  { key: "max_loan_amount", value: "50000", description: "Max loan amount in sandbox (AED)" },
  { key: "max_portfolio_total", value: "1000000", description: "Max total portfolio (AED)" },
  { key: "sandbox_mode", value: "true", description: "Sandbox mode active" },
  { key: "real_money_mode", value: "false", description: "Real money movement (false = test)" },
];

async function main() {
  for (const p of products) {
    await prisma.loanProduct.upsert({ where: { productCode: p.productCode }, update: p, create: p });
  }
  for (const c of sandboxConfig) {
    await prisma.sandboxConfig.upsert({ where: { key: c.key }, update: { value: c.value, description: c.description }, create: c });
  }

  const lender = await prisma.lender.upsert({
    where: { cbuaeLicenceNo: "CBUAE-SANDBOX-0001" },
    update: {},
    create: {
      name: "Al Nahda Finance (Sandbox)",
      nameShort: "Al Nahda",
      cbuaeLicenceNo: "CBUAE-SANDBOX-0001",
      licenceVerified: true,
      isActive: true,
      isSandboxEnabled: true,
      rating: 4.6,
    },
  });

  // Every product gets a lender offering so applications always resolve.
  for (const p of products) {
    const product = await prisma.loanProduct.findUniqueOrThrow({ where: { productCode: p.productCode } });
    await prisma.lenderProduct.upsert({
      where: { lenderId_loanProductId: { lenderId: lender.id, loanProductId: product.id } },
      update: { offeredApr: p.baseApr },
      create: {
        lenderId: lender.id,
        loanProductId: product.id,
        offeredApr: p.baseApr,
        maxAmount: p.maxAmount,
        minAmount: p.minAmount,
        availableTerms: p.availableTerms,
      },
    });
  }

  // ── Demo user with an active loan (so a fresh login shows real data) ──
  const phone = "+971500000001";
  const demo = await prisma.user.upsert({
    where: { phoneNumber: phone },
    update: {},
    create: {
      phoneNumber: phone,
      phoneVerified: true,
      email: "ganbat1@gmail.com",
      fullName: "Ganbat Otgon",
      kycStatus: "verified",
      creditScore: 720,
      creditLimit: 35000,
      availableCredit: 35000,
      preferredLanguage: "en",
      isSandboxUser: true,
    },
  });

  await prisma.kycProfile.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      emiratesIdNumber: "784-1990-1234567-1",
      fullNameEn: "Ganbat Otgon",
      nationality: "MNG",
      biometricMatchScore: 96,
      amlScreeningResult: "clear",
      amlScreeningDate: new Date(),
    },
  });

  const existing = await prisma.loan.findFirst({ where: { userId: demo.id } });
  if (!existing) {
    const product = await prisma.loanProduct.findUniqueOrThrow({ where: { productCode: "express_personal" } });
    const lp = await prisma.lenderProduct.findFirstOrThrow({ where: { loanProductId: product.id, lenderId: lender.id } });

    const principal = 5000;
    const apr = 21;
    const term = 12;
    const start = new Date();
    start.setDate(start.getDate() - 50); // first installment already in the past
    const { monthlyPayment, installments } = buildSchedule(principal, apr, term, start);

    const application = await prisma.loanApplication.create({
      data: {
        applicationNumber: "APP-DEMO-0001",
        userId: demo.id,
        lenderProductId: lp.id,
        loanProductId: product.id,
        lenderId: lender.id,
        requestedAmount: principal,
        requestedTerm: term,
        status: "disbursed",
        eligibilityPassed: true,
        creditScoreAtApp: 720,
        approvedAmount: principal,
        approvedApr: apr,
        approvedTerm: term,
        submittedAt: start,
        decidedAt: start,
        sandboxFlag: true,
      },
    });

    const first = installments[0]!;
    const second = installments[1]!;
    const outstanding = Math.round((principal - first.principalComponent) * 100) / 100;

    const loan = await prisma.loan.create({
      data: {
        loanNumber: "LN-DEMO-0001",
        applicationId: application.id,
        userId: demo.id,
        lenderId: lender.id,
        principalAmount: principal,
        apr,
        termMonths: term,
        monthlyPayment,
        outstandingBalance: outstanding,
        totalPaid: first.totalAmount,
        totalInterestPaid: first.interestComponent,
        paymentsMade: 1,
        paymentsRemaining: term - 1,
        nextPaymentDate: second.dueDate,
        nextPaymentAmount: second.totalAmount,
        status: "active",
        disbursedAt: start,
        sandboxFlag: true,
      },
    });

    await prisma.repaymentSchedule.createMany({
      data: installments.map((i, idx) => ({
        loanId: loan.id,
        installmentNumber: i.installmentNumber,
        dueDate: i.dueDate,
        principalComponent: i.principalComponent,
        interestComponent: i.interestComponent,
        totalAmount: i.totalAmount,
        paidAmount: idx === 0 ? i.totalAmount : 0,
        paidAt: idx === 0 ? i.dueDate : null,
        status: idx === 0 ? "paid" : "pending",
      })),
    });

    await prisma.transaction.createMany({
      data: [
        { referenceNumber: "TXN-DEMO-0001", userId: demo.id, loanId: loan.id, type: "disbursement", amount: principal, direction: "credit", status: "completed", paymentMethod: "iban_transfer", processedAt: start },
        { referenceNumber: "TXN-DEMO-0002", userId: demo.id, loanId: loan.id, type: "repayment", amount: first.totalAmount, direction: "debit", status: "completed", paymentMethod: "iban_debit", processedAt: first.dueDate },
      ],
    });

    await prisma.user.update({
      where: { id: demo.id },
      data: { availableCredit: Math.max(0, 35000 - outstanding) },
    });
  }

  console.log("Seed complete: products, lender offerings, sandbox config, demo user + active loan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
