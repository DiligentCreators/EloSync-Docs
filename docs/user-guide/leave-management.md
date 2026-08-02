# Leave Management — User Guide

Enable **Employees** first, then install **Leave Management** from Marketplace (free). Nav appears under **HR**.

## Leave types

1. Create types such as Annual Leave or Sick Leave with a unique code.
2. Set whether the leave is paid, the annual allowance, and whether the type is active.
3. Inactive types stay in history but should not be used for new requests.

## Balances

1. Upsert a balance for an employee + leave type + calendar year.
2. Set **entitled** days (and optional **used**); **remaining** is kept in sync (`entitled − used`).
3. Approving a leave request increases **used** (and decreases remaining) for that year.

## Who can submit

| Role | Create / submit |
|------|-----------------|
| Staff | Own linked active employee only |
| Manager | Own linked active employee only |
| Admin / Superadmin | Any employee |

Staff lists show only their own requests. Managers and admins see everyone’s requests so they can review pending items.

## Leave requests

1. Create a **draft** request with leave type and start/end dates (days default from the inclusive date span when omitted). Non-admins are locked to themselves.
2. **Submit** moves the request to **pending**.
3. Approvers with `leave-management.approve` can **Approve** or **Reject**:
   - **Reject** requires review notes.
   - **Approve** lets you choose **Deduct salary** (default: deduct when the leave type is unpaid). Overriding that default requires review notes.
4. Drafters can **Cancel** their own draft or pending requests (admins may cancel for others).
5. Only drafts are editable; soft-deleted requests can be restored when permitted.

## Workflow

```text
draft → pending → approved | rejected
draft | pending → cancelled
```

Approved, rejected, and cancelled are terminal.

## Payroll note

When Payroll is installed, approved leave with **Deduct salary** reduces that employee’s pay-run net (legacy approved rows without the flag treat unpaid types as deductible).
