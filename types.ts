
export interface Service {
    id: string
    user_id: string
    first_seen_at: string | null
    last_seen_at: string | null
    email_count: number | null
    is_breached: boolean | null
    service: {
        id: string
        name: string | null
        domain: string | null
        default_privacy_email: string | null
        category: string | null
    }
}

export type Category =
    | "social"
    | "shopping"
    | "subscriptions"
    | "finance"
    | "developer"
    | "newsletters"
    | "travel"
    | "gaming"
    | "education"
    | "health"