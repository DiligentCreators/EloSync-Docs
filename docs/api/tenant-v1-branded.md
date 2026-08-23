# Tenant API — Branded domain

Base path: `/api/tenant/v1`  
Auth: Sanctum tenant token + tenancy context  
Gate: `module:branded`, then Spatie permissions below

## GET `/branded/domain`

Permission: `branded.view`

Returns current custom domain status and DNS instructions.

```json
{
  "status": "success",
  "data": {
    "branded_active": true,
    "domain": {
      "id": 12,
      "domain": "app.example.co.uk",
      "type": "custom",
      "verified": false,
      "verified_at": null,
      "ssl_provisioned": false,
      "ssl_provisioned_at": null,
      "hosting_status": "dns_pending",
      "is_primary": true,
      "claimed_at": "2026-07-24T00:00:00+00:00"
    },
    "instructions": {
      "hostname": "app.example.co.uk",
      "txt_name": "_elosync-verification.app.example.co.uk",
      "txt_value": "elosync-verify-…",
      "a_record_name": "app.example.co.uk",
      "a_record_value": "203.0.113.10",
      "www_cname_name": "www.app.example.co.uk",
      "www_cname_value": "app.example.co.uk",
      "server_ipv4": ["203.0.113.10"],
      "server_ipv6": [],
      "cname_target": "workspaces.example.test",
      "examples": ["myai.com.pk", "app.domain.co.uk", "crm.example.com"]
    }
  }
}
```

## POST `/branded/domain`

Permission: `branded.manage`  
Body: `{ "domain": "myai.com.pk" }`

Proposes / replaces the workspace custom hostname (must not be a platform subdomain). Returns `201` with domain + instructions.

## POST `/branded/domain/verify`

Permission: `branded.manage`

Checks TXT ownership and A/AAAA/CNAME pointing. Sets `verified_at` on success and `hosting_status` to `ssl_pending` until SSL is provisioned on the edge.

`hosting_status` values: `dns_pending` (unverified), `ssl_pending` (DNS verified, TLS not yet live), `active` (DNS + SSL complete).

## DELETE `/branded/domain`

Permission: `branded.manage`

Removes the custom domain mapping.
