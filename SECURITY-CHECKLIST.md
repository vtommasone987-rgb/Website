# OPTS Website — Security Checklist

Every check from the OWASP Top 10 (2025) review, with a box for each one.

- **Ticked boxes** are done in the code. Nothing for you to do.
- **Empty boxes** need you, in a browser, signed into an account. Each one has steps.
- Items marked **HOST** depend on where the site ends up running and are listed once that's decided.

Last updated: 2026-09-17.

---

## How to use this

Work down **Part 2** in order. It's sorted by which account you sign into, so you
can do a whole section in one sitting. Most take a few minutes.

If a menu looks different from what's written here, these dashboards get
redesigned regularly — look for the setting by name rather than by exact path.

---

## Part 1 — Done in code

You don't need to do anything for these. They're listed so you know what's covered.

### A01 Broken access control
- [x] Admin pages are gated server-side (`src/proxy.ts`), and every action re-checks (`src/app/admin/actions.ts`)
- [x] Employees can't reach owner-only pages (Analytics, Security log, deleting staff)
- [x] No sensitive files reachable over the web (`.env`, `.git`, source, database schema all return 404)
- [x] No source maps published
- [x] No open redirects — the only user-controlled redirect is locked to `/admin`
- [x] Cross-site request forgery blocked (verified: a request from another site is refused)

### A02 Security misconfiguration
- [x] Strict Content-Security-Policy, no `unsafe-eval`, no `unsafe-inline` for scripts
- [x] Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy
- [x] Framework version header removed
- [x] Custom 404 and error pages that reveal nothing
- [x] Leftover starter files deleted

### A03 Supply chain
- [x] Dependencies updated; live vulnerabilities reduced from 13 to 4
- [x] The remaining 4 documented as not applicable (see Appendix)
- [x] Lockfile committed
- [x] No third-party scripts at all; fonts self-hosted
- [x] Dependabot configured (`.github/dependabot.yml`) — **but see B3 to switch alerts on**

### A04 Cryptographic failures
- [x] No secrets in code or git history (full history scanned)
- [x] Secrets in environment variables with a documented `.env.example`
- [x] Passwords hashed with scrypt, never stored readable
- [x] Two-factor secrets encrypted at rest

### A05 Injection
- [x] No unsafe HTML, `eval`, or `document.write` anywhere
- [x] All database queries parameterized
- [x] Every public form field validated server-side
- [x] Every admin form field validated server-side
- [x] Email header injection prevented ahead of any mail being sent

### A06 Insecure design
- [x] Honeypot field on both forms
- [x] Minimum time-to-submit check
- [x] Cloudflare Turnstile CAPTCHA, verified server-side — **dormant until B2**
- [x] Rate limiting on both forms and the login
- [x] Only necessary data collected
- [x] Privacy page covering form submissions

### A07 Authentication
- [x] Session cookies are HttpOnly, Secure, SameSite=Strict
- [x] Sessions end when the browser closes, capped at 7 days
- [x] Brute-force protection that can't be bypassed by spoofing a header
- [x] Two-factor groundwork built — **finish at C1**

### A08 Integrity
- [x] Nothing untrusted is loaded or executed at runtime
- [x] Subresource Integrity — not applicable, there are no external scripts

### A09 Logging
- [x] Failed sign-ins, blocked submissions and rate-limit trips recorded
- [x] Viewable at **Admin → Security**
- [x] Logs deliberately exclude passwords, message contents and customer emails

### A10 Exceptional conditions
- [x] Forms fail safely with a friendly message instead of crashing
- [x] Error messages reveal nothing internal
- [x] Server errors handled without leaking stack traces

---

## Part 2 — Your to-do list

### A. Accounts (do these first — highest value for the time)

#### A1. Turn on 2-step verification everywhere
**Why:** If someone gets into your GoDaddy account, they can point your domain
anywhere — at a fake copy of your site, or at their own mail server. That's worse
than them getting into the website itself. This is the single most valuable
thing on this list.

Do this for **all** of these:
- [ ] GoDaddy (domain)
- [ ] GitHub (the code)
- [ ] Cloudflare (once you create it)
- [ ] **The email account used to reset the above** — if someone owns your email, they own everything else

**Steps (same idea on each site):**
1. Sign in, open **Account settings** → look for **Security** or **Sign-in**
2. Find "Two-step verification" / "Two-factor authentication" / "2FA"
3. Choose **authenticator app** — not text message. (SIM-swap fraud makes texts the weakest option, and phone numbers get recycled.)
4. Scan the QR code with Microsoft Authenticator or Google Authenticator
5. **Save the backup codes it gives you.** Print them or put them in a password manager — not in your email

#### A2. Unique passwords, one login per person
- [ ] Get a password manager (Bitwarden is free; 1Password is paid)
- [ ] Make sure GoDaddy, GitHub, Cloudflare and your email each have a **different** password
- [ ] Never share one login between people — each employee gets their own at **Admin → Employees**, which already exists

**Why:** One reused password leaking on any unrelated website is how most small
businesses get compromised. Attackers try the same email and password everywhere.

#### A3. Lock the domain
- [ ] GoDaddy → **My Products** → your domain → **Domain Settings**
- [ ] Turn **Domain Lock** ON (blocks transfers away from your account)
- [ ] Turn **Auto-renew** ON

**Why:** An expired domain can be bought by anyone, including someone who wants
to impersonate your company. Domain lock stops a transfer even if someone gets
into the account.

---

### B. GitHub (5 minutes)

#### B1. Protect the main branch
- [ ] Repository → **Settings** → **Branches** → **Add branch protection rule**
- [ ] Branch name pattern: `main`
- [ ] Tick **Require a pull request before merging**

#### B2. Turn on security alerts
- [ ] Repository → **Settings** → **Code security**
- [ ] Enable **Dependabot alerts**
- [ ] Enable **Dependabot security updates**
- [ ] Enable **Secret scanning** and **Push protection**

**Why:** The config file is already in the repo, but GitHub won't act on it until
these switches are on. Push protection is the useful one day-to-day: it stops you
accidentally committing a password or key.

#### B3. Check the repository is private
- [ ] Repository → **Settings** → scroll to the bottom → confirm it says **Private**

**Why:** Your code doesn't contain passwords, but it does show exactly how the
site is built — which saves an attacker a lot of guesswork.

---

### C. The website itself

#### C1. Finish two-factor on your admin login
- [ ] Install **Microsoft Authenticator** or **Google Authenticator** on your phone
- [ ] Tell me when you have it, and I'll finish the setup screen
- [ ] Scan the QR code, type one code to confirm
- [ ] **Save the 10 backup codes somewhere safe**

Devices stay remembered for 30 days, so you won't type a code most days.

#### C2. Switch on the CAPTCHA
- [ ] Create a free account at **dash.cloudflare.com**
- [ ] Go to **Turnstile** → **Add widget**
- [ ] Name it "OPTS website", add your domain
- [ ] Copy the **Site Key** and **Secret Key**
- [ ] Put them in your `.env.local` file as `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`

It's built and tested — it just needs the keys. Nothing changes until both are set.

#### C3. Replace the placeholder contact details
- [ ] The email and opening hours on the Contact page are still fake placeholders
- [ ] The address and phone number are real
- [ ] Also decide how long you keep form submissions, and put it on the Privacy page

---

### D. Domain and email (Cloudflare DNS)

Do these once the site is hosted and DNS is pointed at Cloudflare.

#### D1. Stop others sending email pretending to be you
- [ ] Add an **SPF** record — lists which servers may send mail as your domain
- [ ] Add **DKIM** — your mail provider gives you this record
- [ ] Add **DMARC** — start with `v=DMARC1; p=none; rua=mailto:you@ohprotech.com`
- [ ] After a few weeks of reports, tighten it to `p=quarantine`, then `p=reject`

**Why:** Without these, anyone can send email that looks like it came from your
company. For an IT provider, a convincing fake invoice from "you" to your own
clients is a serious problem.

**Start at `p=none`** — it only monitors. Jumping straight to `p=reject` can
silently stop your own legitimate email.

#### D2. DNSSEC
- [ ] Cloudflare → your domain → **DNS** → **Settings** → enable **DNSSEC**
- [ ] Cloudflare gives you a record to add at **GoDaddy** — add it there to finish

#### D3. CAA records
- [ ] Cloudflare → **DNS** → add a **CAA** record naming which certificate
      authorities may issue certificates for your domain

**Why:** Stops another company being issued a valid HTTPS certificate for your
domain, which would let them impersonate your site convincingly.

#### D4. Tidy up DNS
- [ ] Review every DNS record and delete anything pointing at a service you no longer use

**Why:** A record pointing at an abandoned service lets someone else claim that
service and serve content on your subdomain.

#### D5. Buy the obvious misspellings
- [ ] Check a few lookalikes of `ohprotech.com` and buy any that are cheap and plausible

---

### E. Monitoring

#### E1. Uptime and certificate expiry
- [ ] Sign up at **uptimerobot.com** (free tier is fine)
- [ ] Add an **HTTPS monitor** for your domain, checked every 5 minutes
- [ ] Turn on the **SSL certificate expiry** notification
- [ ] Point alerts at an email you actually read

#### E2. Certificate Transparency
- [ ] Sign up at **crt.sh** or Cloudflare's certificate alerts
- [ ] Get notified whenever any certificate is issued for your domain

**Why:** This is how you find out someone got a certificate for your domain
without your knowledge — usually the first sign of an impersonation attempt.

#### E3. Google Search Console
- [ ] Go to **search.google.com/search-console**, add your domain
- [ ] Verify with the DNS record it gives you

**Why:** Google tells you here if it detects your site has been hacked or is
serving malware — often before you'd notice yourself.

---

### F. Hosting — **HOST, decide first**

These can't be written until you pick where the site runs. Once decided:

- [ ] HTTPS everywhere, all HTTP redirected to HTTPS
- [ ] One canonical domain (either `www` or not — pick one, redirect the other)
- [ ] TLS 1.2 and 1.3 only
- [ ] Web application firewall
- [ ] DDoS protection
- [ ] Bot protection
- [ ] Preview/default URLs locked down or redirected
- [ ] Automated backups with a **restore you have actually tested**
- [ ] Set `CLIENT_IP_HEADER` so rate limiting sees real visitor addresses (see `.env.example`)

**Note:** GoDaddy's basic/free web hosting **cannot run this site** — it serves
PHP and static files, and this is a Node.js application with a database.
Cloudflare's free tier can, permits business use, and would cover the firewall,
DDoS and bot protection items above in one go.

---

## Part 3 — Check your work

Once the site is live on a real domain, run these three free scans.

### securityheaders.com
- [ ] Enter your domain
- [ ] **Target: A or A+**

Should already pass — the headers are in place. If it scores lower, the host is
probably stripping or overriding them.

### SSL Labs — ssllabs.com/ssltest
- [ ] Enter your domain (takes a couple of minutes)
- [ ] **Target: A or A+**

This grades the encryption itself, which is the host's job, not the code's.

### Mozilla Observatory — developer.mozilla.org/en-US/observatory
- [ ] Enter your domain
- [ ] **Target: A or A+**

Checks headers and configuration together.

**If a score is low, don't guess** — send me the report and I'll tell you what it
means and whether it's the code or the host.

---

## Part 4 — Secrets to change

- [ ] **`ADMIN_PASSWORD`** — change it. It appeared in our working session transcript. It was never committed to git, but rotate it on principle.
- [ ] **`ADMIN_SESSION_SECRET`** — same. Changing it signs everyone out, which is harmless.
- [ ] Generate replacements with:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **Do not** change `MFA_ENCRYPTION_KEY` after anyone has set up two-factor — it would lock them out of their authenticator and they'd have to re-scan.

---

## Appendix — Known and accepted

Things deliberately not "fixed", with reasons, so nobody wastes time on them later.

**4 dependency vulnerabilities remain.** All in the Prisma database toolchain:
`prisma` → `@prisma/config` → `deepmerge-ts`, and `prisma` → `mysql2`. The MySQL
one is the headline, and this site uses PostgreSQL — that driver ships with the
tool but is never loaded. npm's suggested fix is a downgrade to Prisma 6, which
would break the database layer entirely. Revisit at the Prisma 8 upgrade.

**One `unsafe-inline` remains in the Content-Security-Policy**, scoped to style
*attributes* only. Verified necessary: removing it blocks the image handling used
by the logo, shop grid and photo galleries. It cannot execute JavaScript, and
injected stylesheets are still blocked.

**The login system is custom rather than a third-party library.** It's built on
standard, vetted building blocks (scrypt, HMAC-SHA256, constant-time comparison)
and was tested against forged and tampered sessions without success. Replacing it
with an off-the-shelf library is defensible but carries its own risk of breaking
a working system. Worth revisiting if the site grows.

**Rate limiting is stored in memory.** It resets when the site restarts, and on
some hosting each server keeps its own count. Fine at current traffic; if the
site moves to multi-server hosting, this should move to shared storage.

**The local development database crashes often.** Not a security issue and not a
problem for a hosted database — it's a limitation of the built-in development
one. A hosted database (Neon's free tier) ends it.
