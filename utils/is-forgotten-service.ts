export function isForgottenService(service: {
    first_seen_at: string | null;
    last_seen_at: string | null;
    email_count: number | null;
}): {
    isForgotten: boolean;
    confidence: "low" | "medium" | "high";
    reason: string;
} {
    // Safety checks
    if (!service.last_seen_at) {
        return {
            isForgotten: false,
            confidence: "low",
            reason: "Insufficient data to determine"
        };
    }

    const now = new Date();
    const lastSeen = new Date(service.last_seen_at);
    const firstSeen = service.first_seen_at ? new Date(service.first_seen_at) : null;

    // Calculate months since last activity
    const monthsSinceLastSeen = getMonthsDifference(lastSeen, now);

    // Calculate account age (if available)
    const accountAgeMonths = firstSeen
        ? getMonthsDifference(firstSeen, now)
        : null;

    const emailCount = service.email_count ?? 0;

    // ============================================
    // SIMPLE MVP RULES
    // ============================================

    // Rule 1: Very old + inactive = FORGOTTEN (high confidence)
    if (monthsSinceLastSeen >= 12) {
        return {
            isForgotten: true,
            confidence: "high",
            reason: `No activity in ${monthsSinceLastSeen} months`
        };
    }

    // Rule 2: Moderately old + low volume = LIKELY FORGOTTEN (medium confidence)
    if (monthsSinceLastSeen >= 6 && emailCount <= 5) {
        return {
            isForgotten: true,
            confidence: "medium",
            reason: `Only ${emailCount} emails in ${monthsSinceLastSeen} months of inactivity`
        };
    }

    // Rule 3: Old signup, barely used = FORGOTTEN (medium confidence)
    if (monthsSinceLastSeen >= 6 && accountAgeMonths && accountAgeMonths >= 12 && emailCount <= 10) {
        return {
            isForgotten: true,
            confidence: "medium",
            reason: `Account created ${accountAgeMonths} months ago, only ${emailCount} emails, last seen ${monthsSinceLastSeen} months ago`
        };
    }

    // Rule 4: Recent but very low engagement = POSSIBLY FORGOTTEN (low confidence)
    if (monthsSinceLastSeen >= 3 && emailCount <= 3) {
        return {
            isForgotten: true,
            confidence: "low",
            reason: `Low engagement: ${emailCount} emails, ${monthsSinceLastSeen} months inactive`
        };
    }

    // Default: Active
    return {
        isForgotten: false,
        confidence: "low",
        reason: `Last seen ${monthsSinceLastSeen} months ago`
    };
}

// Helper function
function getMonthsDifference(date1: Date, date2: Date): number {
    const years = date2.getFullYear() - date1.getFullYear();
    const months = date2.getMonth() - date1.getMonth();
    return years * 12 + months;
}