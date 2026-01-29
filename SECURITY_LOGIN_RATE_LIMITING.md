# Login Rate Limiting & Account Lockout Security Implementation

## Overview

This document describes the comprehensive rate limiting and account lockout system implemented to protect against brute-force and credential-stuffing attacks on the login functionality.

## Vulnerability Fixed

**Vulnerability**: Lack of Rate Limit on Login Functionality Leading to Account Takeover  
**Severity**: High  
**OWASP**: A7:2021 – Identification and Authentication Failures

### Previous Issues
- No rate limiting on login attempts
- Unlimited brute-force attack capability
- No account lockout mechanism
- No challenge response after failures (CAPTCHA)
- No security event logging

## Implementation Details

### 1. Multi-Level Rate Limiting

#### IP-Based Rate Limiting
- **Limit**: 10 login/signup attempts per 15 minutes per IP
- **Purpose**: Prevents distributed brute-force attacks
- **Implementation**: `loginRateLimitByIP` in `utils/login-rate-limit.ts`

#### Email-Based Rate Limiting
- **Limit**: 5 login attempts per 15 minutes per email
- **Purpose**: Protects individual accounts from targeted attacks
- **Implementation**: `loginRateLimitByEmail` in `utils/login-rate-limit.ts`

### 2. Account Lockout Mechanism

#### Failed Attempt Tracking
- **Max Failed Attempts**: 5 consecutive failed login attempts
- **Lockout Duration**: 30 minutes
- **Attempt Window**: 15 minutes (auto-resets after period)
- **Tracking**: Per-email failed attempt counter in Redis

#### Lockout Behavior
- Account is locked after 5 failed attempts
- User receives clear message: "Account temporarily locked due to too many failed login attempts"
- Lockout automatically expires after 30 minutes
- Admin can manually unlock via API

### 3. Progressive Challenge System

#### CAPTCHA Trigger
- **Threshold**: 3 failed attempts
- **Response Flag**: `shouldShowCaptcha` returned in login response
- **Frontend Action**: UI displays CAPTCHA after 3 failures
- **Purpose**: Prevents automated attacks while maintaining UX

### 4. Security Event Logging

#### Logged Events
- `failed_attempt` - Failed login tries
- `successful_login` - Successful authentications
- `account_locked` - Account lockout events
- `captcha_required` - CAPTCHA challenge events

#### Event Data Stored
- Timestamp
- Email address
- Client IP address
- Event type
- User agent
- Reason/error message

#### Retention
- 30 days for general audit trail
- 7 days for per-user event list (100 most recent)
- 1 hour for IP failure tracking

### 5. Suspicious Activity Detection

#### Detection Patterns
- Multiple IPs accessing same account (>3 different IPs)
- Rapid failed attempts (≥3 failures in recent history)
- High-frequency attempt patterns

#### Response
- Flags returned as `suspicious` and `riskLevel` in response
- Available for frontend to trigger additional verification
- Logged for admin review

## API Integration

### Login Action (`app/login/action.ts`)

```typescript
export async function login({ email, password }: { email: string, password: string }) {
    // Rate limit check
    const rateLimitCheck = await checkLoginRateLimit(email, ip)
    
    // Attempt authentication
    const { error } = await supabase.auth.signInWithPassword(data)
    
    if (error) {
        // Record and log failure
        await recordFailedLoginAttempt(email)
        await logLoginSecurityEvent({ ... })
    } else {
        // Clear attempts on success
        await clearFailedLoginAttempts(email)
        await logLoginSecurityEvent({ ... })
    }
}
```

### Signup Action (`app/login/action.ts`)

- Same rate limiting applied
- Prevents credential stuffing during registration
- Protects against automated account creation

## Admin APIs

### Manage Account Lockout
**Endpoint**: `POST /api/auth/manage-lockout`

**Headers**:
```
Authorization: Bearer {ADMIN_API_TOKEN}
```

**Body - Unlock Account**:
```json
{
  "action": "unlock",
  "email": "user@example.com"
}
```

**Body - Check Status**:
```json
{
  "action": "status",
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "email": "user@example.com",
  "isLocked": true,
  "failedAttempts": 5,
  "lockoutExpiresAt": "2024-01-29T15:30:00Z"
}
```

### View Security Event Logs
**Endpoint**: `GET /api/auth/security-logs?email=user@example.com&limit=50`

**Headers**:
```
Authorization: Bearer {ADMIN_API_TOKEN}
```

**Response**:
```json
{
  "email": "user@example.com",
  "eventCount": 10,
  "events": [
    {
      "timestamp": "2024-01-29T14:25:00Z",
      "email": "user@example.com",
      "ip": "192.168.1.1",
      "eventType": "failed_attempt",
      "reason": "Invalid login credentials"
    }
  ]
}
```

## Configuration

### Environment Variables

Set in `.env.local`:
```
ADMIN_API_TOKEN=your-secure-token-here
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Rate Limit Parameters

Edit in `utils/login-rate-limit.ts`:
```typescript
const LOCKOUT_DURATION = 30 * 60 * 1000        // 30 minutes
const MAX_FAILED_ATTEMPTS = 5                   // 5 attempts
const CAPTCHA_THRESHOLD = 3                     // 3 attempts for CAPTCHA
```

## Frontend Integration

### Login Form Response Handling

```typescript
const response = await login({ email, password })

if (!response.success) {
  // Show rate limit error
  if (response.accountLocked) {
    showError('Account temporarily locked. Try again later.')
  } else if (response.shouldShowCaptcha) {
    showCaptcha()  // Trigger CAPTCHA display
  } else {
    showError(response.error)
  }
  
  // Optional: Show remaining attempts
  if (response.remainingAttempts >= 0) {
    console.log(`Remaining attempts: ${response.remainingAttempts}`)
  }
  
  // Optional: Flag suspicious activity
  if (response.suspicious) {
    console.warn(`Suspicious activity detected: ${response.riskLevel}`)
  }
}
```

## Security Benefits

✅ **Brute-Force Protection**: 10 attempts per IP per 15 minutes  
✅ **Account Lockout**: Automatic after 5 failures (30 min)  
✅ **Progressive Challenge**: CAPTCHA after 3 failures  
✅ **Audit Trail**: Complete security event logging  
✅ **Anomaly Detection**: Suspicious pattern identification  
✅ **Admin Control**: Manual unlock and status monitoring  
✅ **OWASP Compliant**: Meets A7:2021 controls  

## Monitoring & Maintenance

### Daily Tasks
- Review security logs for patterns
- Check for locked accounts needing admin intervention
- Monitor IP-based attack attempts

### Weekly Tasks
- Analyze failed attempt trends
- Review suspicious activity flags
- Check for coordinated attacks

### Admin Commands
```bash
# Check account status
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://ghostsweep.com/api/auth/manage-lockout \
  -X POST \
  -d '{"action":"status","email":"user@example.com"}'

# Unlock account
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://ghostsweep.com/api/auth/manage-lockout \
  -X POST \
  -d '{"action":"unlock","email":"user@example.com"}'

# View security logs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://ghostsweep.com/api/auth/security-logs?email=user@example.com&limit=50"
```

## Testing

### Test Brute-Force Protection
1. Attempt login 6+ times in quick succession
2. Verify rate limit error on attempt 6+
3. Verify account locks after 5 failures
4. Verify lock clears after 30 minutes

### Test CAPTCHA Trigger
1. Attempt login 3 times with wrong password
2. Verify `shouldShowCaptcha: true` on 3rd attempt
3. Verify UI displays CAPTCHA widget

### Test IP-Based Limiting
1. Simulate requests from different IPs
2. Verify 10-attempt limit per IP enforced
3. Verify different IPs have independent counters

### Test Successful Login
1. After 2 failed attempts, attempt correct password
2. Verify successful login clears failed attempts
3. Verify success event logged

## Incident Response

### If Account is Locked
1. Verify legitimate user identity via email
2. Use admin API to unlock account
3. Log the unlock action
4. Optionally notify user via email

### If Coordinated Attack Detected
1. Check security logs for attack pattern
2. Review IPs involved
3. Consider implementing IP whitelist
4. Alert security team

### If Rate Limits Too Restrictive
Adjust in `utils/login-rate-limit.ts`:
- Increase `loginRateLimitByIP` window from 100 to 150
- Decrease lockout duration from 30 to 15 minutes
- Monitor impact on legitimate users

## Future Enhancements

1. **2FA Integration**: Require 2FA after N failures
2. **Email Notifications**: Alert users of suspicious activity
3. **IP Whitelist**: Allow trusted IPs to bypass limits
4. **CAPTCHA Service**: Integrate reCAPTCHA v3 for adaptive challenges
5. **Geo-IP Blocking**: Block logins from suspicious countries
6. **Device Fingerprinting**: Track login devices for anomaly detection
7. **SMS Verification**: Send OTP to registered phone on lockout

## References

- [OWASP A7:2021 - Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Upstash Rate Limiting Documentation](https://upstash.com/docs/redis/features/ratelimiting)
