# Frontend Integration Guide: Login Rate Limiting

## Overview

The login action now returns additional security information to help the frontend display appropriate messages and UI elements.

## Response Structure

All login actions return a response object with the following structure:

```typescript
interface LoginResponse {
  success: boolean
  error?: string
  shouldShowCaptcha?: boolean
  remainingAttempts?: number
  accountLocked?: boolean
  suspicious?: boolean
  riskLevel?: 'low' | 'medium' | 'high'
}
```

## Handling Login Responses

### Successful Login
```typescript
if (response.success) {
  // Redirect user to dashboard
  router.push('/dashboard')
}
```

### Rate Limited (Too Many Attempts)
```typescript
if (!response.success && !response.accountLocked) {
  // Show error message with remaining attempts
  showError({
    title: 'Too Many Failed Attempts',
    message: response.error,
    hint: response.remainingAttempts >= 0 
      ? `Remaining attempts: ${response.remainingAttempts}` 
      : undefined
  })
}
```

### Account Locked
```typescript
if (response.accountLocked) {
  showError({
    title: 'Account Temporarily Locked',
    message: response.error,
    hint: 'Please try again in 30 minutes or reset your password'
  })
  
  // Optionally show password reset link
  showPasswordResetLink()
}
```

### CAPTCHA Required
```typescript
if (response.shouldShowCaptcha) {
  // Display CAPTCHA widget
  showCaptchaWidget({
    onSuccess: (token) => {
      // Submit login with CAPTCHA token
      submitLoginWithCaptcha(email, password, token)
    }
  })
}
```

### Suspicious Activity Detected
```typescript
if (response.suspicious) {
  // Show additional verification
  showAdditionalVerification({
    riskLevel: response.riskLevel,
    message: 'We detected unusual activity. Please verify your identity.'
  })
  
  // Optionally require 2FA
  if (response.riskLevel === 'high') {
    requireTwoFactorAuth()
  }
}
```

## Complete Example

```typescript
'use client'

import { useState } from 'react'
import { login } from './action'
import CaptchaWidget from '@/components/captcha-widget'
import ErrorAlert from '@/components/error-alert'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await login({ email, password })

      if (response.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // Handle different error types
        if (response.accountLocked) {
          setError(
            'Your account has been temporarily locked due to too many failed login attempts. ' +
            'Please try again in 30 minutes or reset your password.'
          )
        } else if (response.shouldShowCaptcha) {
          setShowCaptcha(true)
          setError(response.error || 'Please complete the CAPTCHA to continue.')
        } else {
          setError(response.error || 'Login failed. Please try again.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <ErrorAlert message={error} />}
      
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={loading || showCaptcha}
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={loading || showCaptcha}
        />
        
        {showCaptcha && (
          <CaptchaWidget
            onSuccess={(token) => {
              // Re-submit with CAPTCHA
              console.log('CAPTCHA completed, re-submit form')
            }}
          />
        )}
        
        <button type="submit" disabled={loading || showCaptcha}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
```

## UI Recommendations

### Rate Limit Warning
Show after 2 failed attempts:
```
⚠️ Warning: 3 attempts remaining before temporary lockout
```

### CAPTCHA Prompt (After 3 Failures)
```
🤖 Please verify you're human
[CAPTCHA Widget]
```

### Account Locked
```
🔒 Account Temporarily Locked
This account has been locked for 30 minutes due to too many failed login attempts.
You can [reset your password](link) or try again later.
```

### Suspicious Activity Alert
```
🚨 Unusual Activity Detected
We've detected suspicious login attempts. 
Please [verify your identity](link) or [enable 2FA](link).
```

## Error Messages to Display

| Condition | Message |
|-----------|---------|
| Rate limited | "Too many login attempts. Please wait a few minutes." |
| Account locked | "Account temporarily locked. Try again in 30 minutes." |
| Invalid credentials + attempts remaining | "Incorrect email or password. {N} attempts remaining." |
| CAPTCHA required | "Please verify you're human by completing the CAPTCHA." |
| Suspicious activity | "We detected unusual activity. Please verify your identity." |
| Invalid email | "Please enter a valid email address." |
| Missing password | "Password is required." |

## Password Reset Integration

Show password reset link when account is locked:

```typescript
if (response.accountLocked) {
  return (
    <div>
      <p>{response.error}</p>
      <a href="/forgot_password">
        Can't wait? Reset your password instead
      </a>
    </div>
  )
}
```

## Accessibility Considerations

### CAPTCHA
- Ensure CAPTCHA has audio alternative
- Use ARIA labels for all inputs
- Show remaining attempts with `aria-live`

### Error Messages
```html
<div role="alert" aria-live="polite">
  {error}
</div>
```

### Progress Indicator
```html
<div aria-label="Login attempts: 2 of 5">
  Attempts remaining: 3
</div>
```

## Testing

### Test Cases

1. **Normal Login**
   - Valid email + password → success
   - Invalid email + password → error message

2. **Rate Limiting**
   - 5 failed attempts → account locked
   - 3 failed attempts → CAPTCHA shown
   - Successful login → counter reset

3. **Account Locked**
   - Attempt login after lock → error message
   - Wait 30+ minutes → can login again
   - Click "Reset Password" → redirect to reset page

4. **Suspicious Activity**
   - Login from different IPs → high risk flag
   - Rapid attempts → suspicious flag
   - Show additional verification prompt

### Mock Testing

```typescript
// Mock successful login
jest.mock('./action', () => ({
  login: jest.fn().mockResolvedValue({
    success: true
  })
}))

// Mock account locked
jest.mock('./action', () => ({
  login: jest.fn().mockResolvedValue({
    success: false,
    error: 'Account temporarily locked...',
    accountLocked: true,
    remainingAttempts: 0
  })
}))

// Mock CAPTCHA required
jest.mock('./action', () => ({
  login: jest.fn().mockResolvedValue({
    success: false,
    error: 'Incorrect email or password.',
    shouldShowCaptcha: true,
    remainingAttempts: 2
  })
}))
```

## Performance Considerations

- Rate limit checks are <10ms (Redis cached)
- Security event logging is non-blocking
- No additional API calls needed beyond standard auth
- CAPTCHA loading happens client-side only

## Troubleshooting

### Issue: CAPTCHA Not Showing
- Check `response.shouldShowCaptcha` is true
- Verify 3+ failed attempts have occurred
- Clear browser cache/cookies

### Issue: Account Won't Unlock
- Verify 30 minutes have passed since lock
- Use admin API to manually unlock if needed
- Check Redis connection in logs

### Issue: Rate Limit Too Strict
- Contact admin to temporarily unlock account
- Check environment variables are set correctly
- Review rate limit thresholds in `utils/login-rate-limit.ts`

## Support

For technical questions about the login rate limiting implementation:
- See `SECURITY_LOGIN_RATE_LIMITING.md` for detailed documentation
- See `VULNERABILITY_FIX_SUMMARY.md` for implementation overview
- Contact security team for admin API access
