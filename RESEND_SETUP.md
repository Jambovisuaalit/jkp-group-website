# JKP Group – Resend production setup

## Current status

- Resend domain: `jkpgroup.fi`
- Region: `eu-west-1`
- TLS: enforced
- Open tracking: disabled
- Click tracking: disabled
- Sending: enabled after DNS verification
- Receiving: disabled
- API key: dedicated sending-only key created; store only in Vercel as `RESEND_API_KEY`

## Required DNS records

Add these records at the DNS provider for `jkpgroup.fi`.

### DKIM

- Type: `TXT`
- Name: `resend._domainkey`
- Value: `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQclT7e8hjO5z12+qHnsy8K9Jpzszab0J7KR+TLu4Ta7iDgudcWHvfSCnwPOAHKxdrDyZCK4s8jUMj5D6KIzKomgz0Ro8xNtQand37GW5jYxavC2Th2K8DtzytZaNU3v/aKiRjyHilHWH6eRqdhATvyExTQcf08O55/qlsBzlbNwIDAQAB`
- TTL: Auto

### Return-Path / SPF MX

- Type: `MX`
- Name: `send`
- Value: `feedback-smtp.eu-west-1.amazonses.com`
- Priority: `10`
- TTL: Auto

### SPF

- Type: `TXT`
- Name: `send`
- Value: `v=spf1 include:amazonses.com ~all`
- TTL: Auto

## Vercel environment variables

Configure in both Preview and Production:

```text
RESEND_API_KEY=<dedicated JKP sending key>
CONTACT_FROM_EMAIL=JKP Group <noreply@jkpgroup.fi>
CONTACT_TO_EMAIL=jari.koskela@jkpgroup.fi
```

The API key must never be committed to GitHub, copied to Google Drive, or exposed through a `NEXT_PUBLIC_` variable.

## Verification sequence

1. Add all three DNS records.
2. Start domain verification in Resend.
3. Wait until the Resend domain status is `verified`.
4. Add the environment variables to Vercel.
5. Redeploy the Git-connected Vercel project.
6. Send one test submission for each form type.
7. Confirm delivery to `jari.koskela@jkpgroup.fi` and verify the Resend delivery log.
