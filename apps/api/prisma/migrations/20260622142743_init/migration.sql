-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('pending', 'in_review', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "PreferredLanguage" AS ENUM ('en', 'hi', 'tl', 'bn', 'ur');

-- CreateEnum
CREATE TYPE "AmlScreeningResult" AS ENUM ('clear', 'flagged', 'blocked');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('draft', 'submitted', 'eligibility_check', 'documents_pending', 'under_review', 'approved', 'rejected', 'cancelled', 'disbursed');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('active', 'settled', 'defaulted', 'written_off');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('pending', 'paid', 'partially_paid', 'overdue', 'waived');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('disbursement', 'repayment', 'early_settlement', 'penalty', 'refund', 'remittance');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'completed', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('emirates_id_front', 'emirates_id_back', 'selfie', 'salary_slip', 'bank_statement', 'employment_letter', 'loan_agreement', 'other');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('push', 'sms', 'email');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('user', 'admin', 'lender', 'system');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "email" VARCHAR(255),
    "full_name" VARCHAR(255),
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'pending',
    "credit_score" INTEGER,
    "credit_limit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "available_credit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "preferred_language" "PreferredLanguage" NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_sandbox_user" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "emirates_id_number" VARCHAR(20),
    "emirates_id_front_s3" VARCHAR(500),
    "emirates_id_back_s3" VARCHAR(500),
    "selfie_s3" VARCHAR(500),
    "full_name_en" VARCHAR(255),
    "full_name_ar" VARCHAR(255),
    "nationality" VARCHAR(3),
    "gender" VARCHAR(10),
    "date_of_birth" DATE,
    "emirates_id_expiry" DATE,
    "address_area" VARCHAR(100),
    "address_city" VARCHAR(50),
    "uaeid_api_response" JSONB,
    "biometric_match_score" DECIMAL(5,2),
    "aml_screening_result" "AmlScreeningResult" NOT NULL DEFAULT 'clear',
    "aml_screening_date" TIMESTAMPTZ(6),
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "review_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "kyc_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_products" (
    "id" UUID NOT NULL,
    "product_code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "name_hi" VARCHAR(255),
    "name_tl" VARCHAR(255),
    "name_bn" VARCHAR(255),
    "name_ur" VARCHAR(255),
    "description_en" TEXT,
    "base_apr" DECIMAL(5,2) NOT NULL,
    "max_amount" DECIMAL(12,2) NOT NULL,
    "min_amount" DECIMAL(12,2) NOT NULL DEFAULT 1000,
    "available_terms" INTEGER[],
    "min_credit_score" INTEGER NOT NULL DEFAULT 600,
    "min_age" INTEGER NOT NULL DEFAULT 21,
    "max_age" INTEGER NOT NULL DEFAULT 65,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lenders" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_short" VARCHAR(50),
    "cbuae_licence_no" VARCHAR(50) NOT NULL,
    "licence_verified" BOOLEAN NOT NULL DEFAULT false,
    "licence_expiry" DATE,
    "contact_email" VARCHAR(255),
    "api_endpoint" VARCHAR(500),
    "api_key_encrypted" TEXT,
    "logo_url" VARCHAR(500),
    "rating" DECIMAL(3,1) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_sandbox_enabled" BOOLEAN NOT NULL DEFAULT false,
    "onboarded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lender_products" (
    "id" UUID NOT NULL,
    "lender_id" UUID NOT NULL,
    "loan_product_id" UUID NOT NULL,
    "offered_apr" DECIMAL(5,2) NOT NULL,
    "max_amount" DECIMAL(12,2) NOT NULL,
    "min_amount" DECIMAL(12,2) NOT NULL,
    "available_terms" INTEGER[],
    "min_credit_score" INTEGER NOT NULL DEFAULT 600,
    "max_dti_ratio" DECIMAL(4,2) NOT NULL DEFAULT 0.50,
    "early_settlement_fee" DECIMAL(4,2) NOT NULL DEFAULT 0.01,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "lender_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_applications" (
    "id" UUID NOT NULL,
    "application_number" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL,
    "lender_product_id" UUID NOT NULL,
    "loan_product_id" UUID NOT NULL,
    "lender_id" UUID NOT NULL,
    "requested_amount" DECIMAL(12,2) NOT NULL,
    "requested_term" INTEGER NOT NULL,
    "purpose" VARCHAR(100),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'draft',
    "rejection_reason" TEXT,
    "approved_amount" DECIMAL(12,2),
    "approved_apr" DECIMAL(5,2),
    "approved_term" INTEGER,
    "eligibility_passed" BOOLEAN,
    "credit_score_at_app" INTEGER,
    "esign_completed_at" TIMESTAMPTZ(6),
    "esign_ip_address" INET,
    "submitted_at" TIMESTAMPTZ(6),
    "decided_at" TIMESTAMPTZ(6),
    "decided_by" UUID,
    "sandbox_flag" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" UUID NOT NULL,
    "loan_number" VARCHAR(20) NOT NULL,
    "application_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "lender_id" UUID NOT NULL,
    "principal_amount" DECIMAL(12,2) NOT NULL,
    "apr" DECIMAL(5,2) NOT NULL,
    "term_months" INTEGER NOT NULL,
    "monthly_payment" DECIMAL(12,2) NOT NULL,
    "outstanding_balance" DECIMAL(12,2) NOT NULL,
    "total_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_interest_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "disbursed_at" TIMESTAMPTZ(6),
    "next_payment_date" DATE,
    "next_payment_amount" DECIMAL(12,2),
    "payments_made" INTEGER NOT NULL DEFAULT 0,
    "payments_remaining" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'active',
    "early_settlement_date" DATE,
    "early_settlement_amount" DECIMAL(12,2),
    "sandbox_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repayment_schedules" (
    "id" UUID NOT NULL,
    "loan_id" UUID NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_component" DECIMAL(12,2) NOT NULL,
    "interest_component" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paid_at" TIMESTAMPTZ(6),
    "status" "ScheduleStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "repayment_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "reference_number" VARCHAR(30) NOT NULL,
    "user_id" UUID NOT NULL,
    "loan_id" UUID,
    "schedule_id" UUID,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'AED',
    "direction" "TransactionDirection" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(30),
    "iban_last4" VARCHAR(4),
    "bank_reference" VARCHAR(100),
    "processed_at" TIMESTAMPTZ(6),
    "failure_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "application_id" UUID,
    "document_type" "DocumentType" NOT NULL,
    "s3_key" VARCHAR(500) NOT NULL,
    "s3_bucket" VARCHAR(100) NOT NULL,
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "retention_until" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "actor_type" "ActorType",
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "request_id" UUID,
    "sandbox_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sandbox_config" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sandbox_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_kyc_status_idx" ON "users"("kyc_status");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_profiles_user_id_key" ON "kyc_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_profiles_emirates_id_number_key" ON "kyc_profiles"("emirates_id_number");

-- CreateIndex
CREATE UNIQUE INDEX "loan_products_product_code_key" ON "loan_products"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "lenders_cbuae_licence_no_key" ON "lenders"("cbuae_licence_no");

-- CreateIndex
CREATE UNIQUE INDEX "lender_products_lender_id_loan_product_id_key" ON "lender_products"("lender_id", "loan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "loan_applications_application_number_key" ON "loan_applications"("application_number");

-- CreateIndex
CREATE INDEX "loan_applications_user_id_idx" ON "loan_applications"("user_id");

-- CreateIndex
CREATE INDEX "loan_applications_status_idx" ON "loan_applications"("status");

-- CreateIndex
CREATE INDEX "loan_applications_lender_id_idx" ON "loan_applications"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "loans_loan_number_key" ON "loans"("loan_number");

-- CreateIndex
CREATE UNIQUE INDEX "loans_application_id_key" ON "loans"("application_id");

-- CreateIndex
CREATE INDEX "loans_user_id_idx" ON "loans"("user_id");

-- CreateIndex
CREATE INDEX "loans_status_idx" ON "loans"("status");

-- CreateIndex
CREATE INDEX "repayment_schedules_due_date_status_idx" ON "repayment_schedules"("due_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "repayment_schedules_loan_id_installment_number_key" ON "repayment_schedules"("loan_id", "installment_number");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_number_key" ON "transactions"("reference_number");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_loan_id_idx" ON "transactions"("loan_id");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "kyc_profiles" ADD CONSTRAINT "kyc_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lender_products" ADD CONSTRAINT "lender_products_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "lenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lender_products" ADD CONSTRAINT "lender_products_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_lender_product_id_fkey" FOREIGN KEY ("lender_product_id") REFERENCES "lender_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "lenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "loan_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "lenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repayment_schedules" ADD CONSTRAINT "repayment_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "repayment_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "loan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
