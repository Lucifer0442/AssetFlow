-- ============================================================================
-- AssetFlow ERP — Reporting Views (Module 10)
-- ============================================================================
-- All 6 reporting views. No physical report tables.
--
-- USAGE:
--   Add this SQL to a Prisma migration:
--   1. npx prisma migrate dev --create-only --name create_views
--   2. Paste this SQL into the generated migration file
--   3. npx prisma migrate dev
-- ============================================================================

-- ============================================================================
-- VIEW 1: Dashboard KPIs
-- ============================================================================

CREATE OR REPLACE VIEW "vw_dashboard_kpis" AS
SELECT
  (SELECT COUNT(*) FROM "assets")
    AS total_assets,
  (SELECT COUNT(*) FROM "assets" WHERE "status" = 'available')
    AS available_assets,
  (SELECT COUNT(*) FROM "assets" WHERE "status" = 'allocated')
    AS allocated_assets,
  (SELECT COUNT(*) FROM "assets" WHERE "status" = 'under_maintenance')
    AS under_maintenance_assets,
  (SELECT COUNT(*) FROM "assets" WHERE "status" = 'lost')
    AS lost_assets,
  (SELECT COUNT(*) FROM "assets" WHERE "status" = 'retired')
    AS retired_assets,
  (SELECT COUNT(*) FROM "assets" WHERE "status" = 'disposed')
    AS disposed_assets,
  (SELECT COUNT(*) FROM "employees" WHERE "status" = 'active')
    AS active_employees,
  (SELECT COUNT(*) FROM "departments" WHERE "status" = 'active')
    AS active_departments,
  (SELECT COUNT(*) FROM "maintenance_requests"
   WHERE "status" NOT IN ('resolved', 'closed'))
    AS pending_maintenance_requests,
  (SELECT COUNT(*) FROM "resource_bookings" WHERE "status" = 'upcoming')
    AS upcoming_bookings,
  (SELECT COUNT(*) FROM "audit_cycles" WHERE "status" = 'in_progress')
    AS active_audit_cycles,
  (SELECT COUNT(*) FROM "asset_allocations" WHERE "status" = 'active')
    AS active_allocations,
  (SELECT COUNT(*) FROM "asset_transfer_requests" WHERE "status" = 'pending')
    AS pending_transfers;

-- ============================================================================
-- VIEW 2: Asset Utilization
-- ============================================================================

CREATE OR REPLACE VIEW "vw_asset_utilization" AS
SELECT
  a."id"                          AS asset_id,
  a."asset_code",
  a."name"                        AS asset_name,
  a."status"                      AS current_status,
  ac."name"                       AS category_name,
  d."name"                        AS department_name,
  l."name"                        AS location_name,
  COUNT(al."id")                  AS total_allocations,
  MAX(al."allocated_at")          AS last_allocated_at,
  COUNT(mr."id")                  AS total_maintenance_requests,
  CASE
    WHEN a."status" = 'allocated'         THEN 'In Use'
    WHEN a."status" = 'available'         THEN 'Idle'
    WHEN a."status" = 'under_maintenance' THEN 'In Maintenance'
    WHEN a."status" = 'reserved'          THEN 'Reserved'
    ELSE a."status"::TEXT
  END AS utilization_label
FROM "assets" a
LEFT JOIN "asset_categories" ac    ON a."category_id" = ac."id"
LEFT JOIN "departments" d          ON a."department_id" = d."id"
LEFT JOIN "locations" l            ON a."location_id" = l."id"
LEFT JOIN "asset_allocations" al   ON a."id" = al."asset_id"
LEFT JOIN "maintenance_requests" mr ON a."id" = mr."asset_id"
GROUP BY a."id", a."asset_code", a."name", a."status",
         ac."name", d."name", l."name";

-- ============================================================================
-- VIEW 3: Department Summary
-- ============================================================================

CREATE OR REPLACE VIEW "vw_department_summary" AS
SELECT
  d."id"                                 AS department_id,
  d."name"                               AS department_name,
  d."code"                               AS department_code,
  d."status"                             AS department_status,
  COUNT(DISTINCT e."id")                 AS total_employees,
  COUNT(DISTINCT a."id")                 AS total_assets,
  COUNT(DISTINCT a."id")
    FILTER (WHERE a."status" = 'allocated')  AS allocated_assets,
  COUNT(DISTINCT a."id")
    FILTER (WHERE a."status" = 'available')  AS available_assets,
  COUNT(DISTINCT al."id")
    FILTER (WHERE al."status" = 'active')    AS active_allocations,
  COUNT(DISTINCT mr."id")
    FILTER (WHERE mr."status" NOT IN ('resolved', 'closed'))
                                             AS open_maintenance_requests
FROM "departments" d
LEFT JOIN "employees" e            ON d."id" = e."department_id" AND e."status" = 'active'
LEFT JOIN "assets" a               ON d."id" = a."department_id"
LEFT JOIN "asset_allocations" al   ON d."id" = al."department_id"
LEFT JOIN "maintenance_requests" mr ON a."id" = mr."asset_id"
GROUP BY d."id", d."name", d."code", d."status";

-- ============================================================================
-- VIEW 4: Maintenance Statistics
-- ============================================================================

CREATE OR REPLACE VIEW "vw_maintenance_statistics" AS
SELECT
  "maintenance_type",
  "status",
  "priority",
  COUNT(*)                                        AS total_requests,
  AVG(
    EXTRACT(EPOCH FROM ("resolved_at" - "created_at")) / 3600
  )::NUMERIC(10,2)                                AS avg_resolution_hours,
  MIN(
    EXTRACT(EPOCH FROM ("resolved_at" - "created_at")) / 3600
  )::NUMERIC(10,2)                                AS min_resolution_hours,
  MAX(
    EXTRACT(EPOCH FROM ("resolved_at" - "created_at")) / 3600
  )::NUMERIC(10,2)                                AS max_resolution_hours,
  SUM("estimated_cost")                           AS total_estimated_cost,
  SUM("actual_cost")                              AS total_actual_cost,
  AVG("actual_cost")::NUMERIC(15,2)               AS avg_actual_cost
FROM "maintenance_requests"
GROUP BY "maintenance_type", "status", "priority";

-- ============================================================================
-- VIEW 5: Booking Analytics
-- ============================================================================

CREATE OR REPLACE VIEW "vw_booking_analytics" AS
SELECT
  r."id"                          AS resource_id,
  r."name"                        AS resource_name,
  r."resource_type",
  l."name"                        AS location_name,
  COUNT(rb."id")                  AS total_bookings,
  COUNT(rb."id")
    FILTER (WHERE rb."status" = 'completed')  AS completed_bookings,
  COUNT(rb."id")
    FILTER (WHERE rb."status" = 'cancelled')  AS cancelled_bookings,
  COUNT(rb."id")
    FILTER (WHERE rb."status" = 'upcoming')   AS upcoming_bookings,
  AVG(
    EXTRACT(EPOCH FROM (rb."end_time" - rb."start_time")) / 3600
  )::NUMERIC(10,2)               AS avg_booking_duration_hours
FROM "resources" r
LEFT JOIN "locations" l            ON r."location_id" = l."id"
LEFT JOIN "resource_bookings" rb   ON r."id" = rb."resource_id"
GROUP BY r."id", r."name", r."resource_type", l."name";

-- ============================================================================
-- VIEW 6: Audit Reports
-- ============================================================================

CREATE OR REPLACE VIEW "vw_audit_reports" AS
SELECT
  ac."id"                          AS cycle_id,
  ac."cycle_code",
  ac."name"                        AS cycle_name,
  ac."status"                      AS cycle_status,
  ac."start_date",
  ac."end_date",
  COUNT(DISTINCT aa."id")          AS departments_audited,
  COUNT(DISTINCT aa."auditor_id")  AS auditors_involved,
  COUNT(ai."id")                   AS total_items_audited,
  COUNT(ai."id")
    FILTER (WHERE ai."result" = 'verified')   AS verified_count,
  COUNT(ai."id")
    FILTER (WHERE ai."result" = 'missing')    AS missing_count,
  COUNT(ai."id")
    FILTER (WHERE ai."result" = 'damaged')    AS damaged_count,
  COUNT(ai."id")
    FILTER (WHERE ai."result" IS NULL)        AS pending_count,
  COUNT(dr."id")                              AS total_discrepancies,
  COUNT(dr."id")
    FILTER (WHERE dr."is_resolved" = true)    AS resolved_discrepancies,
  COUNT(dr."id")
    FILTER (WHERE dr."is_resolved" = false)   AS open_discrepancies,
  CASE
    WHEN COUNT(ai."id") > 0
    THEN ROUND(
      COUNT(ai."id") FILTER (WHERE ai."result" = 'verified')::NUMERIC
      / COUNT(ai."id") * 100, 2
    )
    ELSE 0
  END AS verification_rate_pct
FROM "audit_cycles" ac
LEFT JOIN "audit_assignments" aa   ON ac."id" = aa."audit_cycle_id"
LEFT JOIN "audit_items" ai         ON aa."id" = ai."audit_assignment_id"
LEFT JOIN "discrepancy_reports" dr ON ai."id" = dr."audit_item_id"
GROUP BY ac."id", ac."cycle_code", ac."name", ac."status",
         ac."start_date", ac."end_date";
