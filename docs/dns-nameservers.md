# DNS / Nameserver reference — thesaplingco.in

> Ops note only. Not linked from the site and does not affect it.
> (Nameservers are public information — visible via any whois/DNS lookup.)

## Registrar
- **Domain registrar:** Hostinger (unchanged)
- **DNS provider (as of 2026-07-12):** Cloudflare
- Only DNS moved to Cloudflare; the domain registration stays with Hostinger.

## Original Hostinger nameservers (before the switch)
Use these to revert to Hostinger-managed DNS at any time:

```
apollo.dns-parking.com
athena.dns-parking.com
```

## Current Cloudflare nameservers (set 2026-07-12)

```
gabe.ns.cloudflare.com
gigi.ns.cloudflare.com
```

## How to revert to Hostinger DNS later (≈2 min, reversible)
1. Hostinger hPanel → **Domains → thesaplingco.in → DNS / Nameservers**
2. **Change Nameservers** → select **"Use Hostinger nameservers"** (or manually enter the two `*.dns-parking.com` values above)
3. **Save**. Propagates in minutes.

> Note: switching back to Hostinger DNS means any records you add in Cloudflare
> (e.g. future email MX records) must be re-created in Hostinger's DNS panel.

## Hosting
- **Site host:** Cloudflare Pages — project `thesaplingco`
- **Source repo:** github.com/thesaplingco-cyber/thesaplingco (branch `main`)
- **Preview URL:** https://thesaplingco.pages.dev
- **Production URL:** https://thesaplingco.in
