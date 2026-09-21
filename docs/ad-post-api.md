# Ad Post API – Backend Reference

Describes how the app posts a **new ad** (not renewal) and what the backend must support.
Source: `components/post/usePostAd.ts`, `components/post/postUtils.ts`, `constants/functions.js`.

- Base URL: `https://admastermarketplace.in/api`
- Auth: every call sends `Authorization: Bearer <authToken>`
- Payment gateway: Razorpay (INR)

---

## 1. Flow overview

```
Open Post screen
  ├─ GET  admin/plans                          → plan list (Normal / Featured / Banner)
  ├─ GET  users/{id}/free-status               ┐ combined → isFreeTrial (is_free OR trial active)
  ├─ GET  users/{id}/free-trial-status         ┘
  └─ GET  payment/free-product-status          → free quota / payment requirement (re-fetched on screen focus)

User fills form → taps Post
  ├─ client validation
  ├─ (Normal plan only) re-fetch payment/free-product-status
  ├─ decide: FREE path or PAID path
  │
  ├─ FREE path ─────────────────────────────► POST payment/verify-and-store
  │
  └─ PAID path
       ├─ POST payment/create-order            → { order_id, total_amount }
       ├─ Razorpay checkout (client SDK)       → razorpay_payment_id / order_id / signature
       └─ POST payment/verify-and-store        → verifies signature + creates the ad
```

After a successful store the app refetches favorites, my-featured, my-banners, approved products and my-products.

---

## 2. Plans

`GET admin/plans` – fields the app relies on:

| Field | Use |
|---|---|
| `id` | `1` = Normal, `2` = Featured, `3` = Banner (app hardcodes these IDs) |
| `type` | `normal` / `basic` / `free` / `featured` / `banner` (fallback when id doesn't match) |
| `name`, `price`, `duration_days` | Display. `price` may be a string; `0` shows as "Free" |

Plan drives limits: **Normal/Featured → up to 4 images. Banner → exactly 1 image** plus banner-only fields.

---

## 3. Free vs paid decision (client logic)

Free-trial and free-status checks are **advisory on the client**; the backend must enforce them again.

Inputs:
- `hasFreeTrialAccess` = free-status `is_free` OR trial `is_active` (or `user.free_trial_enabled === true`)
- `hasAssignedFreeAccess` = `user.is_free == 1` (admin-assigned)
- `isZeroPriceNormalPlan` = selected plan is Normal and `price == 0`
- From `GET payment/free-product-status`:
  - `can_create_free_normal_product` (bool)
  - `requires_payment_for_normal_product` (bool)

Rule (Normal plan, not renewal):

```
if requires_payment_for_normal_product      → PAID path (overrides everything)
else if can_create_free_normal_product
     OR hasFreeTrialAccess
     OR hasAssignedFreeAccess
     OR isZeroPriceNormalPlan               → FREE path
else                                        → PAID path
```

Featured and Banner plans are **never** free by the client rule; they go to PAID unless `create-order` returns `total_amount == 0` (then FREE path with `plan_id`).

Extra cases:
- Free quota used up **and** plan price is 0 → app blocks: "Free limit reached. Please choose a paid plan" (Razorpay can't create orders < ₹1).
- `create-order` returns amount 0 and payment not required → FREE path.

---

## 4. Endpoints

### 4.1 `GET payment/free-product-status`
Response (either bare or wrapped in `data`):
```json
{ "data": { "can_create_free_normal_product": true, "requires_payment_for_normal_product": false } }
```

### 4.2 `GET users/{userId}/free-status`
Reads `data.is_free` (bool).

### 4.3 `GET users/{userId}/free-trial-status`
Reads `data.is_active` (bool).

### 4.4 `POST payment/create-order`
Request:
```json
{ "plan_id": 2 }
```
Response (flat **or** nested under `data`; app accepts both):
```json
{ "order_id": "order_XXXX", "total_amount": 199 }
```
- `order_id` (or `id`) = Razorpay order id
- `total_amount` in **rupees**; the app multiplies by 100 for Razorpay (paise)
- `total_amount` of 0 means free → app skips Razorpay

### 4.5 `POST payment/verify-and-store`  (creates the ad)
Headers: `Authorization`, `accept: application/json`.

Body has **three modes**:

| Mode | When | Payment fields | `plan_id` |
|---|---|---|---|
| Paid | Razorpay succeeded | `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` | sent |
| Free plan | Free path, plan chosen | none | sent |
| Trial / admin `is_free` | (same call; backend decides by user flags) | none | may be present |

> The app currently sends `plan_id` on every free submission (`includeFreePlanId = Boolean(adType?.id)`), so backend should not depend on `plan_id` being absent for trial/`is_free` users.

Common fields:

| Field | Type | Notes |
|---|---|---|
| `category_id` | int | required |
| `sub_category_id` | int | required |
| `child_category_id` | int \| null | only if sub-category has children (`GET subcategories/{id}/children`) |
| `name` | string | ad title, required |
| `description` | string | required |
| `price` | number | `Number(price) \|\| 0` |
| `condition` | `"new"` \| `"used"` | lowercased |
| `price_negotiable` | bool | |
| `custom_fields` | `[{name, value}]` | only rows where both name and value are non-empty; may be `[]` |
| `images` | array | 1–4 items (Banner: 1). Format is whatever the crop/picker step produced (local URI from `ImagePicker`, processed by the upload helper) – confirm multipart vs base64 with the mobile side |

Banner plan (`plan_id == 3`) additional fields:

| Field | Type | Rules |
|---|---|---|
| `banner_image` | image | first image |
| `banner_video_url` | string | required, valid http(s) URL with a dotted host |
| `website_link` | string | required, valid http(s) URL, **max 255 chars** (DB VARCHAR(255)) |
| `video` | string \| null | secondary video link (optional) |

Example (paid, normal):
```json
{
  "plan_id": 1,
  "razorpay_order_id": "order_XXXX",
  "razorpay_payment_id": "pay_XXXX",
  "razorpay_signature": "abcd...",
  "category_id": 4,
  "sub_category_id": 12,
  "child_category_id": null,
  "name": "iPhone 13",
  "description": "Good condition",
  "price": 42000,
  "condition": "used",
  "price_negotiable": true,
  "custom_fields": [{ "name": "Warranty", "value": "6 months" }],
  "images": ["..."]
}
```

Backend responsibilities:
1. Authenticate user.
2. If payment fields present: verify Razorpay signature (`order_id|payment_id` HMAC-SHA256 with secret) and that the order belongs to this user and plan; reject reuse of a payment id.
3. If no payment fields: **re-check eligibility server-side** (free quota, trial, `is_free`, or plan price 0). Reject otherwise.
4. Validate fields above (banner link length/URL rules, image count per plan).
5. Create product + product plan record (plan type, start/expiry from `duration_days`, banner fields).
6. Return success JSON. The app treats any truthy response as success; an empty/falsy response shows "Failed to submit listing".

Error format the app reads: `response.data.error` or `response.data.message` (string), shown directly to the user. Special-cased: message containing both `website_link` and `too long` → "Website link is too long".

---

## 5. Client validation (mirror on server)

- ≥ 1 image (max 4; Banner max 1)
- `name`, `description`, `price` non-empty
- `category_id` and `sub_category_id` required
- Banner: `banner_video_url` and `website_link` required, valid URL, website link ≤ 255 chars
- URLs without a scheme are auto-prefixed with `https://`

---

## 6. Notes / gaps for backend

- Free eligibility is client-computed from several sources; the server must be the source of truth.
- `create-order` failing returns `undefined` on the client (error swallowed) → shown as "Failed to create order".
- Post-success messages depend on plan: banner / featured / normal.
- Renewal uses separate endpoints (`payment/create-renewal-order`, `payment/verify-renewal`) and is out of scope here.
