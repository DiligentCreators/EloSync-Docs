# Payroll adjacent offs/holidays deduction — Production Readiness Audit

| Field | Value |
|-------|-------|
| **Scope** | Tenant setting `payroll_deduct_adjacent_non_work` (default **off**); `PayPeriodCalculator` bridges weekly offs / holidays when adjacent work day is full Absent or unpaid leave; paid leave does not bridge |
| **Companion** | [Attendance](./attendance) · [Payroll](./payroll) · [CHANGELOG](/changelog/) · [User guide — Attendance](/user-guide/attendance) |
| **Date** | 2026-10-15 |

## Verdict

**Ready to ship** after Backend + Frontend + Docs deploy together. No migrate / no catalog bump. Toggle stays off until an admin enables it.

## Checklist

| Item | Result |
|------|--------|
| Setting registered in `TenantSettingDefinitions` (`boolean`, `attendance` group) | **Pass** |
| `UpdateTenantSettingsRequest` validates boolean | **Pass** |
| System default **false** via `resolvePayrollDeductAdjacentNonWork` | **Pass** |
| Contiguous non-work blocks (weekly off ∪ holiday) bridge on either adjacent work day | **Pass** |
| Triggers: full Absent (incl. inferred) or unpaid leave; paid leave never bridges | **Pass** |
| Bridged days added to `absent_days` without double-counting unpaid/absent dates | **Pass** |
| Settings → Attendance Switch + save/reload | **Pass** |
| Pest `PayPeriodCalculatorTest` adjacent cases (16/16) | **Pass** |
| Headed Playwright one-session (`test:e2e:payroll-adjacent-non-work:headed`, Chrome, workers=1) | **Pass** 5/5 (2026-10-15) |

## Deploy steps

1. Deploy Backend (no migrate required for this setting).
2. Deploy Frontend (Settings toggle) and Docs.
3. Smoke: Settings → Attendance → enable **Deduct salary for offs/holidays next to absences** → save → reload stays on.
4. Smoke: Mon–Sat work week; mark a Friday holiday; Absent on Thursday → pay run `absent_days` includes Thursday + Friday; paid leave on Thursday → Friday stays free.
5. Leave toggle **off** on shared demos unless deliberately testing.

## Rollback

Deploy previous Backend/Frontend. Or set `payroll_deduct_adjacent_non_work` to `false` via Settings (no data migration).

## Residual risk

- With Mon–Fri work weeks, a Friday holiday merges with Sat–Sun into one block; absence on Thursday deducts Fri+Sat+Sun. Documented; matches contiguous non-work policy.
- Existing draft pay runs are not recalculated when the toggle changes — recreate drafts after enabling.
