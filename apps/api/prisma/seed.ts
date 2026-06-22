import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 4 loan products from System Specification §4.4.1.
const products = [
  {
    productCode: "standard_rental",
    nameEn: "Standard Rental Financing",
    descriptionEn: "Spread your annual rent into monthly installments.",
    baseApr: 18.0,
    maxAmount: 150000,
    minAmount: 1000,
    availableTerms: [6, 9, 12, 18, 24],
    displayOrder: 1,
  },
  {
    productCode: "premium_rental",
    nameEn: "Premium Rental Financing",
    descriptionEn: "Premium property rental financing.",
    baseApr: 16.0,
    maxAmount: 200000,
    minAmount: 1000,
    availableTerms: [12, 18, 24, 36],
    displayOrder: 2,
  },
  {
    productCode: "express_personal",
    nameEn: "Express Personal Loan",
    descriptionEn: "Fast disbursement for urgent cash needs.",
    baseApr: 21.0,
    maxAmount: 50000,
    minAmount: 1000,
    availableTerms: [6, 9, 12, 18, 24],
    displayOrder: 3,
  },
  {
    productCode: "flexible_personal",
    nameEn: "Flexible Personal Loan",
    descriptionEn: "Flexible terms tailored to the borrower.",
    baseApr: 19.5,
    maxAmount: 100000,
    minAmount: 1000,
    availableTerms: [6, 9, 12, 18, 24, 36],
    displayOrder: 4,
  },
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
    await prisma.loanProduct.upsert({
      where: { productCode: p.productCode },
      update: p,
      create: p,
    });
  }

  for (const c of sandboxConfig) {
    await prisma.sandboxConfig.upsert({
      where: { key: c.key },
      update: { value: c.value, description: c.description },
      create: c,
    });
  }

  // Sample regulated lender + its product offerings (sandbox only).
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

  const standard = await prisma.loanProduct.findUnique({
    where: { productCode: "standard_rental" },
  });
  if (standard) {
    await prisma.lenderProduct.upsert({
      where: {
        lenderId_loanProductId: { lenderId: lender.id, loanProductId: standard.id },
      },
      update: {},
      create: {
        lenderId: lender.id,
        loanProductId: standard.id,
        offeredApr: 18.0,
        maxAmount: 150000,
        minAmount: 1000,
        availableTerms: [6, 9, 12, 18, 24],
      },
    });
  }

  console.log("Seed complete: products, sandbox config, sample lender.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
