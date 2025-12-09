

export type DeletionStatus = "drafted" | "sent" | "received" | "needs_verification" | "in_progress" | "completed" | "failed" | "expired"

export interface UserService {
    id: string
    user_id: string
    first_seen_at: string | null
    last_seen_at: string | null
    email_count: number | null
    service: {
        id: string
        name: string | null
        domain: string | null
        contact: string | null
        category: string | null
        is_breached: boolean | null,
        logo_url: string| null,
    },
    deletion_requests: {
        id: string,
        status: DeletionStatus  | null,
        sent_at: string | null,
        last_reply_at: string | null,
        last_checked_at: string | null
        last_notified_status: DeletionStatus | null,
        last_notified_at: string | null
    }[]
}

export type Category =
    "Social Media" | "Streaming & Entertainment" | "Shopping & E-commerce" | "Financial & Payments" | "Productivity & Work" | "Travel & Transportation" | "Food & Delivery" | "Gaming" | "Health & Fitness" | "News & Media" | "Email & Communication" | "Other" | "All"


export type NotificationType =
    | "deletion_status_update"
    | "new_account_detected"
    | "new_breach_detected"
    | "sweep_completed"
    | "sweep_limit_reached"
    | "gmail_disconnected"
    | "deletion_request_reply"
    | "service_priority_change"
    | "plan_upgraded"
    | "plan_downgraded"
    | "general_announcement";