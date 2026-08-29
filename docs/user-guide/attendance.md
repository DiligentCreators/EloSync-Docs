# Attendance — User Guide

Enable **Employees** first, then install **Attendance** from Marketplace (free). Nav appears under **HR**.

## Office hours & self check

When Attendance is installed, open **Settings → Attendance** to set:

- Office start / end time (local to **Settings → General → Timezone**)
- Grace period (minutes) — on-site check-ins after start + grace are **Late**
- Remote office start / grace — used when staff check in as **Remote**
- **Show check-in / check-out** — when off, self-service buttons are hidden
- **Require late check-in reason** — when late, staff must pick a reason (**Other** needs a written note)
- **Auto check-in on login** — off by default; when on, first login of the day can create an on-site check-in. If you are late and **Require late check-in reason** is on, login does **not** check in (use **Check in** and pick a reason).
- Work week days (used for payroll working-day calendars)

Attendance uses the same workspace **Timezone** as Daily Reminder Time, meetings, and task/follow-up due dates (for example `Asia/Karachi`). There is no separate attendance timezone. See [Tenant Settings — Workspace timezone](/user-guide/tenant-settings#workspace-timezone).

## Self-service check-in / check-out

Linked employees with Attendance create/update permission:

1. Open **Attendance** (you only see **your** records).
2. Press **Check in** next to search (login alone does **not** start the timer unless auto check-in is enabled).
3. Choose **On-site** or **Remote**. If you are late for that mode, pick a reason (and type a note if **Other**).
4. A live **HH:MM** timer starts from your saved check-in time. Closing the tab or logging out does not reset it — when you return, the timer shows the real elapsed time. The same timer (and **Check in** / **Check out**) also appears in the **top header** next to the light/dark theme control whenever you are linked as an employee.
5. Press **Check out** at the end of the day (optional reason; **Other** requires a note).

Admins manage late/check-out reasons from **Attendance → Reasons**.

## Managers and admins

Managers and admins can:

1. View everyone’s records, KPI stats, and who is checked in now (on-site vs remote).
2. **Record attendance** for any employee and date (one record per employee per day).
3. Edit check-in / check-out times, status, and notes for corrections.
4. Manage attendance reasons (admin/owner).

## Daily records

1. Open **Attendance**.
2. Create or complete a record for the day (staff: self only; managers: any employee).
3. Optionally set check-in and check-out times (managers may edit either).
4. Choose status: Present, Absent, Half day, Remote, or Late.
5. Add notes if needed.

Status badges use fixed colors so presence is easy to scan: **Present** (green), **Late** (red), **Absent** (slate), **Half day** (amber), **Remote** (blue).

## List & stats

- Filter by employee, date range, status, and search
- KPI cards show totals including late; managers also see open check-ins (on-site / remote)
- Soft-deleted records can be restored or permanently removed when you have permission

## Tips

- Use **Remote** check-in for WFH days; remote late rules use the remote office start/grace settings.
- Half-day is a status flag in this MVP — it does not auto-split leave balances.
- Link employees to users so self check-in works.
- Paid vs unpaid leave (salary deduction) is configured under Leave types — see Leave Management.
