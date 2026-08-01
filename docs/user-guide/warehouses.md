# Warehouses — User Guide

## Who can use Warehouses

Install the free **Warehouses** module and grant the relevant `warehouses.*` permission.

## List and default warehouse

Open **Warehouses** under **Inventory**. The list supports search and active/deleted filters. The system creates a default warehouse with code **MAIN** when it first needs one. Use the default designation to identify where operations without an explicit warehouse are posted.

## Create and edit

1. Select **New warehouse**.
2. Enter a unique warehouse code and name.
3. Optionally enter an address, mark it inactive, or make it the default.
4. Save.

Only active warehouses can be used for stock posting. Review existing stock before deactivating a location.

## Notes and activity

The detail sheet provides notes and an activity timeline for create, update, note, delete, and restore actions.

## Delete and restore

Deletion is soft. You cannot delete the sole default warehouse; retain or designate another default warehouse first. Restore and permanent deletion require `warehouses.restore` and `warehouses.force.delete` respectively.
