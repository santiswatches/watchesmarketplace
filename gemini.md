# Project Map (gemini.md)

## Status
- **Current Phase:** L - Link & A - Architect
- **Next Step:** Set up A.N.T. 3-Layer Architecture (architecture/, tools/, .tmp/) and verify Cloudflare connections.

## Discovery Answers
- **North Star:** A premium online marketplace for watch reselling. Focus is on high-end aesthetics, projecting security and trust to ensure a flawless shopping experience.
- **Integrations:** Stripe, PayPal, Google Spreadsheet (for order tracking). *Note: Initially no API keys will be used; focus is on core functions.*
- **Source of Truth:** Cloudflare (Hosting) + Cloudflare D1 (Database) + R2 (Storage). (An admin portal will be built separately by the user to manage this data).
- **Delivery Payload:** Initially, orders will be tracked/pushed to a Google Spreadsheet for manual processing by founders. Data schemas in this document must be strictly updated as functionalities evolve.
- **Behavior Rules:** The system is a visually stunning, easy-to-use, and highly functional online marketplace. It must enforce the following rules:
    - **No checkout without an email account** (must login/provide email).
    - Payments are always upfront.
    - Secure and encrypted checkout.

## Data Schema (V1 - Draft)

### 1. Input Form (Raw Data)
- **User Auth:** `{ email: string, password_hash: string, google_auth_token?: string, is_verified: boolean, verification_token?: string }`
- **Checkout Payload:** `{ user_email: string, product_ids: array, total_amount: number, shipping_info: object, payment_method: string (stripe/paypal), payment_token: string }`
- **Search/Filter Query:** `{ search_term: string, brand: array, material: array, tags: array, sort_by: string (price_asc/desc, time_asc/desc) }`

### 2. Processed Output (Payload)
- **Google Spreadsheet (Order Tracking):** 
    `[ Order_ID, Date, Customer_Email, Product_IDs, Total_Price, Payment_Status, Shipping_Address ]`
- **Cloudflare D1 (Database Entities):**
    - **Products Table:** `id`, `name`, `price`, `images (R2 URLs)`, `videos (R2 URLs)`, `description`, `specs`, `tags (new, promo, etc)`
    - **Clients Table:** `user_id`, `email`, `browsing_analytics (time_spent_per_watch)`, `recommended_watches`

## Non-Negotiable Functions
- **Auth:** Email login/Google Auth. Email/password requires email verification via a token link (redirects to page with user-id and token). Google OAuth does not require verification. Password reset handling, mandatory email for checkout, 10% discount for providing email.
- **Search & Filter:** 
    - Filters: Brand, Material (Gold, Rose Gold, Stainless Steel, Others), New Items, Promotions.
    - Sorting: By Price (Low to High / High to Low), By Time (Newest to Oldest / Oldest to Newest).
- **Checkout:** Stripe & PayPal integration (check PayPal 3-month financing), upfront payments only, refund policy for early customers.
- **Legal & SEO:** Terms of Service, Privacy Policy, minimal cookies for SEO.
- **Admin Readiness:** Architecture must support easy updates from the external Admin Portal (Products, Prices, Images).

## Maintenance Log
- [System Pilot] Initialized Project Map according to Protocol 0.
- [System Pilot] Updated Discovery Answers, Non-Negotiable Functions, and Drafted Data Schema.
- [System Pilot] Blueprint Approved by User. Transitioning to Link & Architect phases.
