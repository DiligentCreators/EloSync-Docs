# Attendance — User Guide

Enable **Employees** first, then install **Attendance** from Marketplace (free). Nav appears under **HR**.

## Office hours

When Attendance is installed, open **Settings → Attendance** to set:

- Office start / end time (local to **Settings → General → Timezone**)
- Grace period (minutes) — check-ins after start + grace are marked **Late**
- Work week days (used for payroll working-day calendars)

Attendance uses the same workspace **Timezone** as Daily Reminder Time, meetings, and task/follow-up due dates (for example `Asia/Karachi`). There is no separate attendance timezone. See [Tenant Settings — Workspace timezone](/user-guide/tenant-settings#workspace-timezone).

## Login check-in

When a workspace user who is linked to an **active** employee signs in, the system creates or updates today’s attendance (workspace-local “today” and check-in clock):

- First successful login of the day sets **check-in** and status (**Present** or **Late**)
- The check-in **IP address** is stored from the request
- The browser may also send **GPS coordinates** (if the user allows location access); denied/unavailable location still allows login
- Later logins the same day do not change check-in
- Check-out remains manual on the Attendance page (IP/coordinates can be stored when provided)
- On the attendance record page, stored coordinates open in **Google Maps** via a standard maps URL (no Google API integration)

Users without a linked employee are skipped. If Attendance is not installed, login is unchanged.

## Self-service (staff)

Linked employees with Attendance create/update permission can:

1. Open **Attendance** (you only see **your** records).
2. Use **Check in** if login did not already create today’s check-in.
3. Use **Check out** at the end of the day (stores the current time).
4. Use **Mark attendance** for a fuller form (own employee only). Check-in is set on create (or login auto check-in); staff can only add **check-out** and notes afterward. Managers can correct times later.

Staff cannot change attendance **status** (Present / Absent / etc.). Managers and admins set or correct status when needed.

## Managers and admins

Managers and admins can:

1. View everyone’s records and KPI stats.
2. **Record attendance** for any employee and date (one record per employee per day).
3. Edit check-in / check-out times, status, and notes for corrections.

## Daily records

1. Open **Attendance**.
2. Create or complete a record for the day (staff: self only; managers: any employee).
3. Optionally set check-in and check-out times (managers may edit either).
4. Choose status: Present, Absent, Half day, Remote, or Late.
5. Add notes if needed.

Status badges use fixed colors so presence is easy to scan: **Present** (green), **Late** (red), **Absent** (slate), **Half day** (amber), **Remote** (blue). The same colors appear in the list table and the record page.

## List & stats

- Filter by employee, date range, and status
- KPI cards show totals including late
- Soft-deleted records can be restored or permanently removed when you have permission

## Tips

- Use **Remote** for WFH days that still count as present for workforce reporting.
- Half-day is a status flag in this MVP — it does not auto-split leave balances.
- Link employees to users (or create users with **Create employee record**) so login check-in works.
