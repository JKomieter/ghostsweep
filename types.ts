
export type PrivacyAction = "delete" | "reduce";

export type PrivacyStatus= "drafted" | "sent" | "received" | "needs_verification" | "in_progress" | "completed" | "failed" | "expired"

export interface Service {
    id: string
    user_id: string
    first_seen_at: string | null
    last_seen_at: string | null
    email_count: number | null
    service: {
        id: string
        name: string | null
        domain: string | null
        default_privacy_email: string | null
        category: string | null
        is_breached: boolean | null,
        logo_url: string| null,
    },
    privacy_requests: {
        id: string,
        action: PrivacyAction | null,
        status: PrivacyStatus | null,
        sent_at: string | null,
        last_reply_at: string | null,
        last_checked_at: string | null
        last_notified_status: PrivacyAction | null,
        last_notified_at: string | null
    }[]
}

export type Category =
    "Social Media" | "Streaming & Entertainment" | "Shopping & E-commerce" | "Financial & Payments" | "Productivity & Work" | "Travel & Transportation" | "Food & Delivery" | "Gaming" | "Health & Fitness" | "News & Media" | "Email & Communication" | "Other" | "All"


export type NotificationType =
    | "privacy_status_update"
    | "new_account_detected"
    | "new_breach_detected"
    | "sweep_completed"
    | "sweep_limit_reached"
    | "gmail_disconnected"
    | "privacy_request_reply"
    | "service_priority_change"
    | "plan_upgraded"
    | "plan_downgraded"
    | "general_announcement";