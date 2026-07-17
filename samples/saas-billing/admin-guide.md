# Workspace administration

## Configure SAML SSO

SAML SSO is available on Business and Enterprise plans. A workspace admin can configure SSO under **Settings > Security > SAML SSO**.

1. Copy the workspace ACS URL and Entity ID into the identity provider.
2. Paste the IdP metadata URL or upload its metadata XML.
3. Upload the active signing certificate.
4. Verify each company domain that should use SSO.
5. Test with a non-admin account.
6. Confirm a recovery admin can still sign in, then enable **Enforce SSO**.

Multiple verified domains are supported. Each domain must complete verification separately. If a signing certificate expires or rotates, upload the replacement certificate before enforcing SSO again.

## Members and seats

Owners and admins can invite or remove members under **Settings > Members**. Added paid members increase the seat count immediately. Removed members lose access immediately.

Read-only guests do not consume a paid Business seat, subject to the guest limits shown on the plan page.

> Billing adjustments for seats and ownership recovery when the owner has left the company are handled by support and are not described here.
