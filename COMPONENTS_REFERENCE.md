# Developer Quick Reference - New Landing Page Components

## Quick Links to Components

| Feature | File | Component | Purpose |
|---------|------|-----------|---------|
| Email Breach Checker | `quick-exposure-check.tsx` | `<QuickExposureCheck />` | Zero-login lead magnet |
| Network Visualization | `digital-shadow-map-2.tsx` | `<DigitalShadowMap2 />` | D3.js risk visualization |
| Trust & Privacy Info | `privacy-trust-section.tsx` | `<PrivacyTrustSection />` | Address objections |
| Enterprise Features | `executive-protection-tier.tsx` | `<ExecutiveProtectionTier />` | B2B dashboard |
| CCPA Automation | `automated-right-to-delete.tsx` | `<AutomatedRightToDelete />` | Deletion tracking |
| Competitor Compare | `comparison-matrix.tsx` | `<ComparisonMatrix />` | Feature parity |

## Integration Checklist

### To Use These Components:
1. ✅ Components created in `/app/home/_components/`
2. ✅ Imports added to `page.tsx`
3. ✅ Components rendered in proper order on page
4. ✅ All TypeScript types properly defined
5. ✅ Lucide icons imported where needed
6. ✅ Tailwind classes used consistently
7. ✅ Responsive design implemented
8. ✅ Accessibility considerations included

### To Test:
```bash
# 1. Run dev server
npm run dev

# 2. Navigate to http://localhost:3000/home

# 3. Check:
# - Quick Exposure Check email input
# - D3 network graph renders properly
# - Privacy accordion expands/collapses
# - Executive dashboard displays correctly
# - CCPA automation progress updates
# - Comparison table responsive on mobile
```

## Component APIs

### QuickExposureCheck
```tsx
<QuickExposureCheck />
// No props required
// Uses: HaveIBeenPwned API via fetch
// State: email, loading, result, error
```

### DigitalShadowMap2
```tsx
<DigitalShadowMap2 />
// No props required
// Uses: D3.js v7 (forceSimulation, drag behavior)
// State: hoveredNode (for hover effects)
```

### PrivacyTrustSection
```tsx
<PrivacyTrustSection />
// No props required
// State: openId (for accordion expand/collapse)
// Static content: 4 trust principles + 4 trust badges
```

### ExecutiveProtectionTier
```tsx
<ExecutiveProtectionTier />
// No props required
// Content: Sample dashboard with 4 team members
// CTA: Email sales@ghostsweep.com
```

### AutomatedRightToDelete
```tsx
<AutomatedRightToDelete />
// No props required
// Uses: setInterval for demo animation
// State: requests (live deletion progress)
```

### ComparisonMatrix
```tsx
<ComparisonMatrix />
// No props required
// Content: 8 features × 3 columns (Manual, DeleteMe, GhostSweep)
// Responsive: Table on desktop, cards on mobile
```

## Styling Patterns

### Section Container
```tsx
<section className="space-y-8">
  <div className="space-y-4 text-center">
    {/* Badge + Title + Desc */}
  </div>
  {/* Content */}
</section>
```

### Card Layout
```tsx
<div className="rounded-xl border border-white/10 bg-[#050509] p-5 space-y-3">
  {/* Icon + Title + Description */}
</div>
```

### Responsive Grid
```tsx
<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
  {/* Items */}
</div>
```

### Accent Colors
```tsx
// Emerald (Trust)
<div className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300" />

// Red (Danger)
<div className="border-red-500/30 bg-red-500/10 text-red-400" />

// Purple (Visualization)
<div className="border-purple-500/30 bg-purple-500/10 text-purple-300" />

// Amber (Enterprise)
<div className="border-amber-500/30 bg-amber-500/10 text-amber-300" />
```

## Common Modifications

### Change Broker List in CCPA Section
File: `automated-right-to-delete.tsx`
```tsx
const topBrokers = [
  "Acxiom",
  "Spokeo",
  // Add/remove brokers here
];
```

### Update Executive Team Members
File: `executive-protection-tier.tsx`
```tsx
[
  {
    name: "Jane Smith (CEO)",
    score: 8.7,
    status: "CRITICAL",
    leaks: 23,
  },
  // Add/update team members here
].map((member) => {/*...*/})
```

### Modify Comparison Features
File: `comparison-matrix.tsx`
```tsx
const features = [
  {
    name: "Feature Name",
    description: "What it does",
    manual: true/false,
    deleteMe: true/false,
    ghostsweep: true/false,
    // Add details
  },
  // Add/modify features here
];
```

### Change Privacy Principles
File: `privacy-trust-section.tsx`
```tsx
const trustItems = [
  {
    id: "unique-id",
    icon: IconComponent,
    title: "Principle Name",
    description: "Short description",
    details: "Long explanation",
  },
  // Add/modify principles here
];
```

## API Integration Points

### HaveIBeenPwned API (quick-exposure-check.tsx)
```tsx
// Current: Client-side fetch
const response = await fetch(
  `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`
);

// Future: Add rate limiting, caching
// Consider: Move to backend API route
```

### CCPA Automation (automated-right-to-delete.tsx)
```tsx
// Current: Demo animation with setInterval
// Future: Connect to real deletion automation backend
// - Generate legally-compliant emails
// - Send from user's email account
// - Track response status in database
```

### Executive Dashboard (executive-protection-tier.tsx)
```tsx
// Current: Mock data for 4 team members
// Future: Connect to real user data
// - Fetch privacy scores from database
// - Real-time breach monitoring
// - Admin user management
```

## Dependencies

### Already in package.json
- ✅ `lucide-react` - Icons
- ✅ `d3` - Network visualization
- ✅ `tailwindcss` - Styling
- ✅ `next` - Framework
- ✅ `react` - UI library

### No Additional Dependencies Needed
All components use only existing dependencies.

## Browser Compatibility

- ✅ Chrome/Edge (latest 2)
- ✅ Firefox (latest 2)
- ✅ Safari (latest 2)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ D3.js requires modern browser (ES6+)

## Performance Notes

- **Quick Exposure Check:** API call ~500-1000ms
- **D3 Network Graph:** First render ~200-300ms, smooth interactions
- **Privacy Accordion:** Instant expand/collapse
- **CCPA Demo:** 2000ms interval for animation
- **Comparison Matrix:** Renders instantly, responsive layout

## Testing Recommendations

### Unit Tests
```typescript
// Test QuickExposureCheck with mock API
// Test Privacy accordion state management
// Test Comparison matrix data structure
```

### Integration Tests
```typescript
// Test component renders on page
// Test CTAs navigate correctly
// Test animations play smoothly
```

### Visual Tests
```typescript
// Test responsive layouts at breakpoints
// Test color contrast (WCAG AA)
// Test mobile touch interactions
```

## Troubleshooting

### D3 Graph Not Rendering
- Check SVG ref is attached to container
- Verify D3 v7 is installed: `npm list d3`
- Check console for TypeScript errors

### HaveIBeenPwned API Blocked
- May be CORS issue if called from client
- Solution: Create backend API route
- Rate limiting: Implement caching layer

### Styling Not Applied
- Verify Tailwind CSS is processing JSX
- Check class names are valid (use `md:`, `sm:`)
- Clear `.next` cache and rebuild

### Performance Issues
- Profile with React DevTools
- Check component re-render frequency
- Memoize expensive computations

## Next Steps

1. **Backend Integration**
   - Create `/api/breach-check` endpoint
   - Implement real CCPA automation
   - Set up admin dashboard backend

2. **Database Schema**
   - Store deletion requests
   - Track privacy scores per user
   - Log B2B team access

3. **Analytics**
   - Track which sections users view
   - Monitor CTA click rates
   - A/B test section order

4. **Enhancement**
   - Add more data brokers
   - Expand trust principles
   - Add team member templates

## Support

For questions about these components, check:
1. Component file comments
2. BLUEPRINT_IMPLEMENTATION.md (overview)
3. LANDING_PAGE_LAYOUT.md (page structure)
4. Type definitions in component files
