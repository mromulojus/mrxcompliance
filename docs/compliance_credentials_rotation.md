# Compliance Credential Rotation

To maintain secure access to sensitive denuncia data, rotate credentials for the compliance team regularly.

## Rotation Steps

1. **Schedule**: Plan rotation during a low-usage window and notify the compliance team in advance.
2. **Create new credentials**:
   - Generate new passwords or API keys for each compliance member.
   - Record credentials in the secure secrets manager.
3. **Update services**:
   - Replace old credentials in environment variables and server configurations.
   - Redeploy services or restart sessions that depend on these credentials.
4. **Distribute securely**:
   - Share new credentials with compliance officers via the approved secure channel.
   - Require confirmation of receipt.
5. **Revoke old credentials**:
   - Remove or disable previous passwords and keys.
   - Audit logs to ensure no further usage of retired credentials.
6. **Document**:
   - Record the rotation event and participants for auditing.
   - Update next scheduled rotation date.

Regular credential rotation limits the window of exposure if credentials are compromised and ensures continuous compliance with security policies.
