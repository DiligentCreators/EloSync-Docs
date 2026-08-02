# Attendance — User Guide

Enable **Employees** first, then install **Attendance** from Marketplace (free). Nav appears under **HR**.

## Office hours

When Attendance is installed, open **Settings → Attendance** to set:

- Office start / end time
- Grace period (minutes) — check-ins after start + grace are marked **Late**
- Work week days (used for payroll working-day calendars)

Timezone comes from **Settings → General**.

## Login check-in

When a workspace user who is linked to an **active** employee signs in, the system creates or updates today’s attendance:

- First successful login of the day sets **check-in** and status (**Present** or **Late**)
- The check-in **IP address** is stored from the request
- The browser may also send **GPS coordinates** (if the user allows location access); denied/unavailable location still allows login
- Later logins the same day do not change check-in
- Check-out remains manual on the Attendance page (IP/coordinates can be stored when provided)
- On the attendance detail sheet, stored coordinates open in **Google Maps** via a standard maps URL (no Google API integration)

Users without a linked employee are skipped. If Attendance is not installed, login is unchanged.

## Daily records

1. Open **Attendance**.
2. Create a record for an employee and date (one record per employee per day).
3. Optionally set check-in and check-out times.
4. Choose status: Present, Absent, Half day, Remote, or Late.
5. Add notes if needed.

## List & stats

- Filter by employee, date range, and status
- KPI cards show totals including late
- Soft-deleted records can be restored or permanently removed when you have permission

## Tips

- Use **Remote** for WFH days that still count as present for workforce reporting.
- Half-day is a status flag in this MVP — it does not auto-split leave balances.
- Link employees to users (or create users with **Create employee record**) so login check-in works.
