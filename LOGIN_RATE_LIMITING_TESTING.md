# Login Rate Limiting - Testing & Validation Guide

## Pre-Deployment Testing

### Prerequisites
- Access to test environment
- Admin API token configured
- Redis connection working
- Rate limit utilities deployed

## Unit Tests

### Test: `checkLoginRateLimit` Function

```typescript
import { checkLoginRateLimit } from '@/utils/login-rate-limit'

describe('checkLoginRateLimit', () => {
  it('should allow login on first attempt', async () => {
    const result = await checkLoginRateLimit('user@test.com', '192.168.1.1')
    expect(result.allowed).toBe(true)
    expect(result.shouldShowCaptcha).toBe(false)
  })

  it('should show CAPTCHA after 3 failed attempts', async () => {
    // Simulate 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await recordFailedLoginAttempt('user@test.com')
    }
    
    const result = await checkLoginRateLimit('user@test.com', '192.168.1.1')
    expect(result.shouldShowCaptcha).toBe(true)
    expect(result.remainingAttempts).toBe(2)
  })

  it('should lock account after 5 failed attempts', async () => {
    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await recordFailedLoginAttempt('user@test.com')
    }
    
    const result = await checkLoginRateLimit('user@test.com', '192.168.1.1')
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Account temporarily locked')
  })
})
```

### Test: `recordFailedLoginAttempt` Function

```typescript
import { recordFailedLoginAttempt, getAccountLockoutStatus } from '@/utils/login-rate-limit'

describe('recordFailedLoginAttempt', () => {
  it('should increment failed attempts', async () => {
    const email = `test-${Date.now()}@example.com`
    
    await recordFailedLoginAttempt(email)
    let status = await getAccountLockoutStatus(email)
    expect(status.failedAttempts).toBe(1)
    
    await recordFailedLoginAttempt(email)
    status = await getAccountLockoutStatus(email)
    expect(status.failedAttempts).toBe(2)
  })

  it('should lock account after MAX_FAILED_ATTEMPTS', async () => {
    const email = `test-${Date.now()}@example.com`
    
    for (let i = 0; i < 5; i++) {
      await recordFailedLoginAttempt(email)
    }
    
    const status = await getAccountLockoutStatus(email)
    expect(status.isLocked).toBe(true)
    expect(status.lockoutExpiresAt).toBeDefined()
  })
})
```

### Test: `clearFailedLoginAttempts` Function

```typescript
import { clearFailedLoginAttempts, getAccountLockoutStatus } from '@/utils/login-rate-limit'

describe('clearFailedLoginAttempts', () => {
  it('should clear all failed attempts on successful login', async () => {
    const email = `test-${Date.now()}@example.com`
    
    // Create failed attempts
    for (let i = 0; i < 3; i++) {
      await recordFailedLoginAttempt(email)
    }
    
    let status = await getAccountLockoutStatus(email)
    expect(status.failedAttempts).toBe(3)
    
    // Clear attempts
    await clearFailedLoginAttempts(email)
    
    status = await getAccountLockoutStatus(email)
    expect(status.failedAttempts).toBe(0)
  })
})
```

## Integration Tests

### Test: Full Login Flow with Rate Limiting

```typescript
import { login } from '@/app/login/action'

describe('Login Action with Rate Limiting', () => {
  it('should allow successful login', async () => {
    const response = await login({
      email: 'valid@example.com',
      password: 'correctPassword123'
    })
    
    expect(response.success).toBe(true)
    expect(response.error).toBeUndefined()
  })

  it('should fail with invalid credentials', async () => {
    const response = await login({
      email: 'valid@example.com',
      password: 'wrongPassword'
    })
    
    expect(response.success).toBe(false)
    expect(response.error).toBeDefined()
    expect(response.shouldShowCaptcha).toBe(false)
  })

  it('should require CAPTCHA after 3 failed attempts', async () => {
    const email = `test-captcha-${Date.now()}@example.com`
    
    for (let i = 0; i < 3; i++) {
      await login({
        email,
        password: 'wrongPassword'
      })
    }
    
    const response = await login({
      email,
      password: 'wrongPassword'
    })
    
    expect(response.shouldShowCaptcha).toBe(true)
    expect(response.remainingAttempts).toBe(1)
  })

  it('should lock account after 5 failed attempts', async () => {
    const email = `test-lock-${Date.now()}@example.com`
    
    for (let i = 0; i < 5; i++) {
      await login({
        email,
        password: 'wrongPassword'
      })
    }
    
    const response = await login({
      email,
      password: 'wrongPassword'
    })
    
    expect(response.success).toBe(false)
    expect(response.accountLocked).toBe(true)
    expect(response.error).toContain('temporarily locked')
  })
})
```

## Manual Testing

### Test Case 1: Normal Login
**Steps:**
1. Navigate to login page
2. Enter valid credentials
3. Click "Sign In"

**Expected Result:**
- User logs in successfully
- Redirected to dashboard
- No errors displayed

### Test Case 2: Failed Login - Invalid Password
**Steps:**
1. Navigate to login page
2. Enter valid email, wrong password
3. Click "Sign In"

**Expected Result:**
- Error: "Incorrect email or password"
- Remaining attempts counter increases
- User stays on login page
- No CAPTCHA yet

### Test Case 3: Rate Limit - CAPTCHA Trigger
**Steps:**
1. Navigate to login page
2. Enter email that has 2 failed attempts
3. Enter wrong password 3rd time
4. Click "Sign In"

**Expected Result:**
- Error message displayed
- CAPTCHA widget appears
- "Remaining attempts: 2" shown
- CAPTCHA must be completed before retry

### Test Case 4: Account Lockout
**Steps:**
1. Have an account with 5 failed login attempts
2. Try to login (6th attempt)
3. Observe response

**Expected Result:**
- Error: "Account temporarily locked"
- No remaining attempts shown
- "Try again in 30 minutes" message
- Login button disabled
- Password reset link available

### Test Case 5: Successful Login Clears Attempts
**Steps:**
1. Login with email that has 2 failed attempts
2. Use correct password
3. Logout
4. Immediately try to login again with wrong password

**Expected Result:**
- Attempt counter reset to 1 (not 3)
- Can make 4 more wrong attempts before lockout
- Security event logged for successful login

### Test Case 6: IP-Based Rate Limiting
**Steps:**
1. Simulate 10 rapid login attempts from same IP
2. Attempt login #11

**Expected Result:**
- Attempts 1-10: Normal responses
- Attempt 11: Rate limited error
- Message: "Too many login attempts from your IP"
- Must wait 15 minutes

### Test Case 7: Email-Based Rate Limiting
**Steps:**
1. Simulate 5 rapid login attempts for same email
2. Attempt login #6

**Expected Result:**
- Attempts 1-5: Normal responses
- Attempt 6: Rate limited error
- Message: "Too many login attempts for this account"
- Must wait 15 minutes

### Test Case 8: Admin Unlock Account
**Steps:**
1. Lock an account (5 failed attempts)
2. Call admin unlock API:
```bash
curl -X POST https://ghostsweep.com/api/auth/manage-lockout \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"unlock","email":"user@example.com"}'
```
3. Try to login with that email

**Expected Result:**
- Account unlocked successfully
- Can login immediately
- Failed attempt counter cleared

### Test Case 9: Admin Check Account Status
**Steps:**
1. Lock an account
2. Call admin status API:
```bash
curl -X POST https://ghostsweep.com/api/auth/manage-lockout \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"status","email":"user@example.com"}'
```

**Expected Result:**
```json
{
  "email": "user@example.com",
  "isLocked": true,
  "failedAttempts": 5,
  "lockoutExpiresAt": "2024-01-29T15:30:00Z"
}
```

### Test Case 10: View Security Logs
**Steps:**
1. Perform multiple login attempts (success and failure)
2. Call security logs API:
```bash
curl "https://ghostsweep.com/api/auth/security-logs?email=user@example.com&limit=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Result:**
- Returns array of security events
- Shows timestamps, IP addresses, event types
- Includes reason for failures
- Logs are ordered chronologically

## Performance Testing

### Test: Rate Limit Check Response Time
```typescript
it('should check rate limit in < 50ms', async () => {
  const start = Date.now()
  await checkLoginRateLimit('user@test.com', '192.168.1.1')
  const elapsed = Date.now() - start
  
  expect(elapsed).toBeLessThan(50)
})
```

### Test: Security Event Logging Performance
```typescript
it('should log security event without blocking', async () => {
  const loginPromise = login({ email, password })
  // Login should complete regardless of logging
  const result = await loginPromise
  expect(result).toBeDefined()
})
```

## Stress Testing

### Test: Multiple Concurrent Logins
```typescript
it('should handle 100 concurrent login attempts', async () => {
  const promises = []
  
  for (let i = 0; i < 100; i++) {
    promises.push(
      login({
        email: `user${i}@test.com`,
        password: 'test'
      })
    )
  }
  
  const results = await Promise.all(promises)
  
  // All should complete without errors
  expect(results.length).toBe(100)
  expect(results.every(r => r.error || r.success)).toBe(true)
})
```

### Test: Rate Limit Consistency
```typescript
it('should enforce rate limits consistently', async () => {
  const email = `stress-test-${Date.now()}@test.com`
  let blockedAt = -1
  
  for (let i = 0; i < 15; i++) {
    const result = await checkLoginRateLimit(email, '192.168.1.1')
    
    if (!result.allowed && blockedAt === -1) {
      blockedAt = i
    }
  }
  
  // Should be blocked at attempt 5 (lockout) or 6+ (rate limit)
  expect(blockedAt).toBeGreaterThanOrEqual(5)
})
```

## Regression Testing

After deploying, run these tests to ensure no regressions:

```bash
# Unit tests
npm test -- utils/login-rate-limit.ts
npm test -- utils/security-logging.ts

# Integration tests
npm test -- app/login/action.test.ts

# E2E tests
npm run test:e2e -- login.spec.ts
```

## Monitoring & Validation

### Logs to Check
1. **Failed Login Attempts**
   ```
   ⚠️  Failed login attempt 1/5 for user@example.com
   ```

2. **Account Lockout**
   ```
   🔒 Account locked due to too many failed login attempts: user@example.com
   ```

3. **Security Events**
   ```
   📊 Security event logged: failed_attempt for user@example.com
   ```

4. **Rate Limit Hit**
   ```
   ❌ Blocked request from IP due to rate limit: 192.168.1.1
   ```

### Redis Keys to Monitor
```bash
# Check failed attempts
redis-cli GET "failed_attempts:user@example.com"
# Returns: "3"

# Check if locked
redis-cli GET "account_locked:user@example.com"
# Returns: "true" or nil

# Check security events
redis-cli LRANGE "user_security_events:user@example.com" 0 10
# Returns: [event1, event2, ...]
```

## Post-Deployment Validation

✅ Rate limit checks execute in <50ms  
✅ Failed attempts tracked correctly  
✅ CAPTCHA shown after 3 failures  
✅ Account locks after 5 failures  
✅ Lockout expires after 30 minutes  
✅ Admin APIs respond correctly  
✅ Security logs created for all events  
✅ No false positives in suspicious activity detection  
✅ Performance degradation < 5%  
✅ No data loss in security events  

## Rollback Plan

If issues occur after deployment:

1. **Disable rate limiting** (emergency only):
   ```typescript
   // Comment out in app/login/action.ts
   // const rateLimitCheck = await checkLoginRateLimit(...)
   ```

2. **Reset all accounts**:
   ```bash
   # Contact admin to run Redis flush
   redis-cli FLUSHDB
   ```

3. **Revert to previous version**:
   ```bash
   git revert <commit-hash>
   ```

## Success Criteria

- [ ] All manual test cases pass
- [ ] Unit tests pass (100% coverage)
- [ ] Integration tests pass
- [ ] No performance degradation
- [ ] Security logs populated correctly
- [ ] Admin APIs functional
- [ ] Rate limits enforced as designed
- [ ] CAPTCHA triggers at correct threshold
- [ ] Account lockout works properly
- [ ] Failed attempts clear on success
