# Landing Page Layout Guide

## Page Flow - New Blueprint Features Integrated

```
┌─────────────────────────────────────────────────────────────────┐
│ HERO SECTION (Existing)                                         │
│ "You have 200+ accounts. You forgot about 180 of them."         │
│ Main CTA: Find My Hidden Accounts                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ HOW IT WORKS (Existing)                                         │
│ 1. Connect Gmail/Outlook                                        │
│ 2. We scan metadata                                             │
│ 3. See everything                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ DIGITAL SHADOW SECTION (Existing)                               │
│ Interactive account discovery results                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ RESULTS PREVIEW (Existing)                                      │
│ Real examples from scans                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FEATURES (Existing)                                             │
│ Key product capabilities                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FOUNDER VIDEO SECTION (Existing)                                │
│ "Real story. Real inbox. No fluff."                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ TRUST SECTION (Existing)                                        │
│ "Privacy-first, not privacy-flavored"                           │
│ Metadata only, Easy revoke, Google OAuth, You approve, Support │
└─────────────────────────────────────────────────────────────────┘
                              ↓
  ┌─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─┐
  │                                                              │
  ├─────────────────────────────────────────────────────────────┤
  │ [NEW] QUICK EXPOSURE CHECK                                  │
  │ ═══════════════════════════════════════════════════════     │
  │ Component: QuickExposureCheck                               │
  │ Purpose: Prove danger before OAuth (Zero-Login Lead Magnet) │
  │ Features:                                                   │
  │  • Email breach checker (HaveIBeenPwned API)               │
  │  • Shows breach count & top services                        │
  │  • High Alert styling                                       │
  │  • Converts to login                                        │
  │ Impact: Immediate value proof → Higher conversion rate      │
  ├─────────────────────────────────────────────────────────────┤
  │ [NEW] DIGITAL SHADOW MAP 2.0                                │
  │ ═══════════════════════════════════════════════════════     │
  │ Component: DigitalShadowMap2                                │
  │ Purpose: Visual provocation of digital exposure             │
  │ Features:                                                   │
  │  • Interactive D3.js network graph                          │
  │  • Central email node                                       │
  │  • Forgotten accounts (L1 nodes)                            │
  │  • Data brokers (L2 nodes - showing active sales)          │
  │  • Hover states & legend                                    │
  │  • Educational callout                                      │
  │ Impact: Makes invisible risk visible → Urgency             │
  ├─────────────────────────────────────────────────────────────┤
  │ [NEW] PRIVACY & TRUST SECTION                               │
  │ ═══════════════════════════════════════════════════════     │
  │ Component: PrivacyTrustSection                              │
  │ Purpose: Address #1 bounce reason (email access fear)      │
  │ Features:                                                   │
  │  • Expandable accordion (4 principles)                      │
  │  • Principle of Least Privilege                            │
  │  • Local Processing & Hashing                              │
  │  • OAuth 2.0 Security                                       │
  │  • CASA Certification (coming soon)                         │
  │  • Trust badges (No Selling, GDPR Ready, etc.)            │
  │ Impact: Removes trust barriers → Better conversion          │
  ├─────────────────────────────────────────────────────────────┤
  │ [NEW] AUTOMATED RIGHT TO DELETE                             │
  │ ═══════════════════════════════════════════════════════     │
  │ Component: AutomatedRightToDelete                           │
  │ Purpose: Automate US CCPA/CPRA requests                    │
  │ Features:                                                   │
  │  • Live progress tracking UI                                │
  │  • Status metrics (Sent, In Progress, Total)               │
  │  • Animated progress bar                                    │
  │  • Simulated deletion request list                          │
  │  • 100+ brokers covered (with top list)                    │
  │  • Cost comparison vs. manual                               │
  │ Impact: Automates tedious task → Pro plan value            │
  ├─────────────────────────────────────────────────────────────┤
  │ [NEW] EXECUTIVE PROTECTION TIER                             │
  │ ═══════════════════════════════════════════════════════     │
  │ Component: ExecutiveProtectionTier                          │
  │ Purpose: B2B/high-ticket revenue ($500+/mo)               │
  │ Features:                                                   │
  │  • Admin dashboard preview                                  │
  │  • Team member privacy scores                               │
  │  • Risk scoring (CRITICAL, HIGH, MEDIUM, LOW)             │
  │  • Role-based access control                                │
  │  • Executive briefings                                      │
  │  • Pricing & demo CTA                                       │
  │ Impact: Opens new revenue stream → Enterprise revenue       │
  ├─────────────────────────────────────────────────────────────┤
  │ [NEW] COMPARISON MATRIX                                      │
  │ ═══════════════════════════════════════════════════════     │
  │ Component: ComparisonMatrix                                 │
  │ Purpose: Competitive differentiation                        │
  │ Features:                                                   │
  │  • 8 key feature comparison                                 │
  │  • Responsive table (desktop) + cards (mobile)             │
  │  • vs. Manual Deletion & DeleteMe/Onerep                  │
  │  • Account Discovery, Shadow Mapping, Opt-Out, etc.       │
  │  • Cost breakdown                                           │
  │ Impact: Shows superiority → Justifies pricing              │
  │                                                              │
  └─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─ NEW ─┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRICING SECTION (Existing)                                      │
│ Free, Pro Monthly ($9.99/mo), Pro Annual ($79/year)            │
│ 1-day free trial for Pro                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FAQ (Existing)                                                  │
│ Common questions about privacy & features                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FINAL CTA (Existing)                                            │
│ "Ready to clean up?"                                            │
│ Find My Hidden Accounts (Free)                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ FOOTER (Existing)                                               │
│ Links, copyright, contact                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Sizing & Spacing

All new components use:
- `space-y-8` / `md:space-y-20` for section spacing
- Consistent border & background styling: `border-white/10 bg-[#050509]`
- Max-width container: `max-w-6xl`
- Responsive padding: `px-4` mobile, `px-6 sm:p-8` larger screens

## Visual Design System

### Colors Used
- **Red (#ef4444):** Danger, breaches, alerts
- **Purple (#9333ea):** Shadow mapping, visualizations
- **Emerald (#10b981):** Trust, security, success
- **Amber (#f59e0b):** Enterprise, B2B, premium
- **Green (#22c55e):** Automation, CCPA, completion
- **Blue (#3b82f6):** Accounts, secondary info

### Typography Hierarchy
- **H1 (text-4xl md:text-6xl):** Main page hero
- **H2 (text-3xl md:text-4xl):** Section titles
- **H3 (font-semibold text-white):** Card titles
- **Body (text-sm text-zinc-400):** Descriptions
- **Small (text-xs):** Fine print

### Components Used
- Lucide React icons (Mail, Lock, Shield, etc.)
- Tailwind CSS for styling
- Radix UI Accordion (implicit in PrivacyTrustSection)
- D3.js v7 for visualization

## User Journey Impact

### Before (Original Landing Page)
User sees → Hero → How it works → Results → Features → FAQ → Pricing
↓
Lower conversion (doesn't see "proof of danger")

### After (With Blueprint Features)
User sees → Hero → How it works → Results → Features → **Breach checker** ← Proof!
          → **Shadow Map** ← Visual risk
          → **Trust section** ← Removes objections
          → **CCPA automation** ← Value proposition
          → **B2B tier** ← Revenue expansion
          → **Competitor comparison** ← Justifies pricing
          → Pricing → FAQ
↓
**Higher conversion + B2B revenue opportunity**

## Performance Optimizations

1. **D3.js component:** Renders once, cleanup in useEffect
2. **Animations:** CSS-based, not JavaScript
3. **Images:** Already optimized in existing sections
4. **API calls:** HaveIBeenPwned (can add caching layer)
5. **Code splitting:** Each component can be lazy-loaded

## Mobile Responsiveness

- All components include `md:` responsive variants
- Grid layouts: `grid gap-4 sm:grid-cols-2 md:grid-cols-3`
- Text sizes: `text-2xl sm:text-3xl md:text-4xl`
- D3 SVG: Responsive to container width
- Comparison Matrix: Table (desktop) → Cards (mobile)

## Future Enhancements

1. Add analytics tracking to each section CTA
2. A/B test section order
3. Add countdown timer to free trial
4. Implement real CCPA automation backend
5. Connect admin dashboard to real user data
6. Add video tutorials for each feature
