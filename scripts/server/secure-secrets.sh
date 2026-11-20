#!/usr/bin/env bash
# Hardens the backend's .env secrets file on the Oracle Cloud server and adds audit logging + alerts.
# Run once on the server as root:   sudo bash secure-secrets.sh /path/to/.env <service-user> <alert-email>
#
# What it does:
#   1. .env readable/writable only by the service user (chmod 600).
#   2. auditd rule: every read, write or attribute change of .env is logged (key: ghostsweep_secrets).
#   3. Email alert (via Resend) on every SSH login, the only way to reach the file.
#   4. Prints the SSH settings so you can confirm key-only login and no root login.
# Safe to run again.
set -euo pipefail

ENV_FILE="${1:?usage: secure-secrets.sh /path/to/.env <service-user> <alert-email>}"
SERVICE_USER="${2:?service user (the account the API runs as)}"
ALERT_EMAIL="${3:?alert email address}"
ALERT_FROM="GhostSweep <support@ghostsweep.com>"

[ "$(id -u)" -eq 0 ] || { echo "Run as root (sudo)."; exit 1; }
[ -f "$ENV_FILE" ] || { echo "No file at $ENV_FILE"; exit 1; }
ENV_FILE="$(readlink -f "$ENV_FILE")"

echo "== 1. File permissions"
chown "$SERVICE_USER":"$SERVICE_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"
ls -l "$ENV_FILE"

echo "== 2. Audit logging (auditd)"
if ! command -v auditctl >/dev/null; then
    if command -v apt-get >/dev/null; then apt-get install -y auditd; else dnf install -y audit; fi
fi
systemctl enable --now auditd
cat > /etc/audit/rules.d/ghostsweep-secrets.rules <<EOF
# Log every read (r), write (w) and attribute change (a) of the backend secrets file
-w $ENV_FILE -p rwa -k ghostsweep_secrets
EOF
augenrules --load >/dev/null 2>&1 || auditctl -R /etc/audit/rules.d/ghostsweep-secrets.rules
auditctl -l | grep ghostsweep_secrets

echo "== 3. SSH login alert"
cat > /usr/local/bin/ghostsweep-login-alert.sh <<EOF
#!/usr/bin/env bash
# Called by PAM on every SSH session start. Emails the security owner. Never blocks the login.
[ "\${PAM_TYPE:-}" = "open_session" ] || exit 0
KEY=\$(grep -E '^RESEND_API_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d "\"' ")
[ -n "\$KEY" ] || exit 0
HOST=\$(hostname)
TEXT="SSH login to \$HOST\nUser: \${PAM_USER:-?}\nFrom: \${PAM_RHOST:-?}\nTime (UTC): \$(date -u +%FT%TZ)\n\nIf this was not you, revoke the SSH key and rotate every secret in the server .env file."
curl -s --max-time 5 https://api.resend.com/emails \\
  -H "Authorization: Bearer \$KEY" -H "Content-Type: application/json" \\
  -d "{\"from\":\"$ALERT_FROM\",\"to\":\"$ALERT_EMAIL\",\"subject\":\"[GhostSweep security] SSH login to \$HOST\",\"text\":\"\$TEXT\"}" >/dev/null &
exit 0
EOF
chmod 700 /usr/local/bin/ghostsweep-login-alert.sh
PAM_LINE="session optional pam_exec.so /usr/local/bin/ghostsweep-login-alert.sh"
grep -qF "$PAM_LINE" /etc/pam.d/sshd || echo "$PAM_LINE" >> /etc/pam.d/sshd
echo "PAM hook installed in /etc/pam.d/sshd (optional: a failure never blocks login)"

echo "== 4. SSH settings (should show: passwordauthentication no, permitrootlogin no)"
sshd -T 2>/dev/null | grep -E '^(passwordauthentication|permitrootlogin|pubkeyauthentication) '

echo
echo "Done. Test: open a NEW ssh session (keep this one open) and check $ALERT_EMAIL."
echo "Audit trail: sudo ausearch -k ghostsweep_secrets -i | tail -40"
