# PharmaSource Cameroun

Licensed medical importation and pharmacy platform. Next.js 15 (App Router),
TypeScript (strict), Tailwind, Server Actions. No paid BaaS.

---

## Getting started

```bash
npm install
cp .env.example .env.local
```

Generate the two secrets `.env.local` needs:

```bash
# SESSION_SECRET
openssl rand -base64 32

# ADMIN_PASSWORD_HASH
node -e "console.log(require('crypto').scryptSync(process.argv[1],'pharmasource',64).toString('hex'))" "your-password-here"
```

```bash
npm run dev     # http://localhost:3000  ·  admin at /admin
```

---

## Architecture

```
src/
├─ app/                      App Router
│  ├─ page.tsx               Landing page (Server Component)
│  ├─ catalog/page.tsx       Full catalogue
│  ├─ admin/                 Protected: layout, inventory, orders, login
│  └─ api/
│     ├─ checkout/callback/  Browser redirect after payment
│     └─ webhooks/flutterwave/  Authoritative settlement signal
├─ components/
│  ├─ sections/              Landing page sections
│  ├─ admin/                 InventoryTable, ProductForm
│  ├─ site/                  Header, Footer
│  └─ ui/                    Button, StatusPill, ColdChainMark
├─ hooks/
│  ├─ useCatalogFilters.ts   Client-side search + filter
│  └─ useInventoryMutations.ts  Optimistic writes via useOptimistic
├─ lib/
│  ├─ types.ts               Domain model — single source of truth
│  ├─ validation.ts          Zod schemas shared by every action
│  ├─ auth.ts / auth-edge.ts Node and Edge halves of session handling
│  ├─ repository/            Persistence port + json/turso drivers
│  └─ payments/              Payment port + Flutterwave driver
├─ server/actions/           All mutations
└─ content/site.ts           All marketing copy
```

**The two ports.** `Repository` and `PaymentProvider` are interfaces with
swappable drivers. Nothing above them knows which driver is live — changing
persistence or payment processor is a new file plus an env var, never a
refactor of a component or action.

---

## Persistence — read this before deploying

| Driver | Where it works | Where it does not |
|---|---|---|
| `json` | Local dev, VPS, Docker, Fly/Railway with a volume | **Vercel, Netlify** — serverless filesystems are read-only and `/tmp` is ephemeral and per-instance |
| `turso` | Everywhere, including serverless | — |

The JSON driver is the default so `npm run dev` works with zero setup. It
serialises writes through an in-process lock and writes atomically
(write-to-temp, then rename), but that lock does not span instances — it is a
single-process store by design.

`src/lib/repository/index.ts` throws at startup if `DATA_DRIVER=json` is used
in production on a serverless host, rather than silently discarding writes.

To move to Turso (free tier, no card):

```bash
turso db create pharmasource
turso db show pharmasource --url        # -> TURSO_DATABASE_URL
turso db tokens create pharmasource     # -> TURSO_AUTH_TOKEN
```

Set `DATA_DRIVER=turso`, then `npm run seed`.

---

## Payments — the Cameroon constraint

**Stripe does not onboard merchants registered in Cameroon, and Paystack
serves Nigeria, Ghana, South Africa and Kenya only.** Neither will work as the
merchant of record for a Cameroonian entity.

The working default here is **Flutterwave**, which settles XAF and covers MTN
Mobile Money, Orange Money and international cards. Domestic alternatives
worth evaluating: **Campay** and **MeSomb**, both of which integrate MoMo and
Orange Money directly and typically price below Flutterwave for local volume.

The `PaymentProvider` port is deliberately narrow (three methods) so adding one
is a single file in `src/lib/payments/`.

### Payment integrity

- Line prices are re-read from the repository inside `startCheckoutAction` —
  never taken from the client payload.
- The **webhook** is authoritative, not the browser redirect. The redirect can
  be abandoned, replayed or forged.
- The webhook verifies the `verif-hash`, then independently re-verifies the
  transaction against Flutterwave's API rather than trusting the posted amount.
- It is idempotent: a replayed webhook for a settled order is a no-op.
- Stock decrements only after payment clears.

---

## Auth

Signed JWT (`jose`, HS256) in an `httpOnly` `SameSite=Lax` cookie, 8-hour
expiry. Credentials are checked with `scrypt` + `timingSafeEqual`. The login
form returns an identical message for unknown email and wrong password so it
cannot enumerate accounts.

Two independent gates, on purpose:

1. `middleware.ts` blocks `/admin/*` at the edge before a route renders.
2. `requireAdmin()` runs at the top of every privileged Server Action.

Server Actions are independently addressable HTTP endpoints — middleware alone
would leave them exposed.

**For a real deployment**, move credentials out of env vars into a `users`
table with per-user salts and Argon2id. The env-var approach here is a
single-admin simplification, and it is the first thing to replace.

---

## What is deliberately left to build

- **Image upload** — `ProductForm` takes a URL. Wire to Vercel Blob or
  UploadThing (both free-tier) for direct upload.
- **Cart and checkout UI** — `startCheckoutAction` is complete and tested-shaped;
  the basket UI that calls it is not built.
- **Order status transitions** — the admin orders page is read-only.
- **Prescription upload** — regulated products need a verification workflow
  before this goes near real patients.
- **i18n** — Cameroon is bilingual. `next-intl` with `fr` as default and `en`
  secondary is the obvious next step; all copy is already isolated in
  `src/content/site.ts`.

---

## Design system

Motif: a customs manifest for amber-glass pharmaceuticals.

| Token | Hex | Role |
|---|---|---|
| `manifest-800` | `#13293D` | Primary ink, dark sections |
| `sterile` | `#F7F9FA` | Page background |
| `phial-500` | `#B26A00` | Accent — amber vial glass |
| `clearance-500` | `#1F6F5C` | Cleared / in-stock status |
| `excursion-500` | `#9B2C2C` | Errors, temperature excursion |

Type: **Fraunces** display (optical-size axis gives headlines a printed-label
weight), **Archivo** UI, **Martian Mono** reserved strictly for real data codes
— lot numbers, HS codes, order references. Never decorative.

The catalogue renders as a ledger, not a card grid: clinicians compare across
rows (origin, temperature band, lead time), and a grid hides exactly the
comparison they need.
