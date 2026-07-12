-- ============================================================================
-- AssetFlow ERP — Manual Constraints & Extensions
-- ============================================================================
-- This SQL must be added to a custom Prisma migration because Prisma cannot
-- generate these features natively.
--
-- USAGE:
--   1. Run: npx prisma migrate dev --name init
--   2. Run: npx prisma migrate dev --create-only --name add_constraints
--   3. Paste this SQL into the generated migration file
--   4. Run: npx prisma migrate dev
-- ============================================================================

-- ============================================================================
-- 1. REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram search on asset names
CREATE EXTENSION IF NOT EXISTS "btree_gist";  -- GiST exclusion for booking overlap

-- ============================================================================
-- 2. CHECK CONSTRAINTS
-- ============================================================================

-- category_custom_fields: valid field types
ALTER TABLE "category_custom_fields"
  ADD CONSTRAINT "chk_custom_fields_type"
  CHECK ("field_type" IN ('text', 'number', 'date', 'boolean', 'select'));

-- assets: non-negative purchase cost
ALTER TABLE "assets"
  ADD CONSTRAINT "chk_assets_purchase_cost"
  CHECK ("purchase_cost" >= 0 OR "purchase_cost" IS NULL);

-- assets: positive useful life
ALTER TABLE "assets"
  ADD CONSTRAINT "chk_assets_life_years"
  CHECK ("expected_life_years" > 0 OR "expected_life_years" IS NULL);

-- asset_documents: valid document types
ALTER TABLE "asset_documents"
  ADD CONSTRAINT "chk_asset_documents_type"
  CHECK ("document_type" IN ('warranty', 'invoice', 'manual', 'other'));

-- asset_transfer_requests: cannot transfer to self
ALTER TABLE "asset_transfer_requests"
  ADD CONSTRAINT "chk_transfer_not_self"
  CHECK ("from_employee_id" != "to_employee_id");

-- asset_returns: valid return conditions
ALTER TABLE "asset_returns"
  ADD CONSTRAINT "chk_return_condition"
  CHECK ("return_condition" IN ('good', 'fair', 'damaged'));

-- resources: positive capacity
ALTER TABLE "resources"
  ADD CONSTRAINT "chk_resources_capacity"
  CHECK ("capacity" > 0 OR "capacity" IS NULL);

-- resource_bookings: end must be after start
ALTER TABLE "resource_bookings"
  ADD CONSTRAINT "chk_bookings_time_range"
  CHECK ("end_time" > "start_time");

-- maintenance_requests: valid priority
ALTER TABLE "maintenance_requests"
  ADD CONSTRAINT "chk_maint_priority"
  CHECK ("priority" IN ('low', 'medium', 'high', 'critical'));

-- maintenance_requests: non-negative estimated cost
ALTER TABLE "maintenance_requests"
  ADD CONSTRAINT "chk_maint_estimated_cost"
  CHECK ("estimated_cost" >= 0 OR "estimated_cost" IS NULL);

-- maintenance_requests: non-negative actual cost
ALTER TABLE "maintenance_requests"
  ADD CONSTRAINT "chk_maint_actual_cost"
  CHECK ("actual_cost" >= 0 OR "actual_cost" IS NULL);

-- audit_cycles: valid date range
ALTER TABLE "audit_cycles"
  ADD CONSTRAINT "chk_audit_cycle_dates"
  CHECK ("end_date" >= "start_date");

-- discrepancy_reports: valid discrepancy types
ALTER TABLE "discrepancy_reports"
  ADD CONSTRAINT "chk_discrepancy_type"
  CHECK ("discrepancy_type" IN ('missing', 'damaged', 'wrong_location', 'mismatch'));

-- ============================================================================
-- 3. PARTIAL UNIQUE INDEX — Prevent double allocation
-- ============================================================================
-- An asset can only have ONE active allocation at a time.

CREATE UNIQUE INDEX "idx_asset_allocations_active_asset"
  ON "asset_allocations" ("asset_id")
  WHERE "status" = 'active';

-- ============================================================================
-- 4. GIST EXCLUSION CONSTRAINT — Prevent booking overlap
-- ============================================================================
-- Two non-cancelled bookings for the same resource cannot overlap in time.
-- Requires btree_gist extension.

ALTER TABLE "resource_bookings"
  ADD CONSTRAINT "excl_booking_overlap"
  EXCLUDE USING gist (
    "resource_id" WITH =,
    tstzrange("start_time", "end_time") WITH &&
  )
  WHERE ("status" != 'cancelled');

-- ============================================================================
-- 5. GIN TRIGRAM INDEX — Fuzzy text search on asset names
-- ============================================================================
-- Requires pg_trgm extension.

CREATE INDEX "idx_assets_name_trgm"
  ON "assets"
  USING gin ("name" gin_trgm_ops);

-- ============================================================================
-- 6. GIN INDEX — JSONB search on activity log details
-- ============================================================================

CREATE INDEX "idx_activity_logs_details"
  ON "activity_logs"
  USING gin ("details");

-- ============================================================================
-- 7. PARTIAL INDEX — Fast unread notification count
-- ============================================================================

CREATE INDEX "idx_notification_recipients_unread"
  ON "notification_recipients" ("employee_id", "is_read")
  WHERE "is_read" = false;

-- ============================================================================
-- 8. DEFERRABLE FK — Resolve circular dependency (departments ↔ employees)
-- ============================================================================
-- departments.head_employee_id → employees.id is circular with
-- employees.department_id → departments.id. Make one DEFERRABLE so both
-- records can be inserted in a single transaction.
--
-- NOTE: Prisma generates this FK automatically. To make it deferrable,
-- drop and re-create it:

-- First, find the auto-generated constraint name:
-- SELECT constraint_name FROM information_schema.table_constraints
--   WHERE table_name = 'departments' AND constraint_type = 'FOREIGN KEY';
--
-- Then:
-- ALTER TABLE "departments" DROP CONSTRAINT "<auto_generated_fk_name>";
-- ALTER TABLE "departments"
--   ADD CONSTRAINT "fk_departments_head_employee"
--   FOREIGN KEY ("head_employee_id") REFERENCES "employees" ("id")
--   ON DELETE SET NULL
--   DEFERRABLE INITIALLY DEFERRED;
