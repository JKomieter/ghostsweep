export type Plan = "free" | "pro"

export type DeletionStatus = "drafted" | "sent" | "received" | "needs_verification" | "in_progress" | "completed" | "failed" | "expired"

export interface Service {
    id: string;
    created_at: string | null;
    name: string | null;
    domain: string | null;
    updated_at: string | null;
    is_breached: boolean | null;
    logo_url: string| null;
    confidence_score: number | null;
    category: Category | null;
    contact: string | null;
}

export interface UserService {
    id: string
    user_id: string
    service_id: string;
    first_seen_at: string | null
    last_seen_at: string | null
    email_count: number | null
    source: "gmail";
    sweep_event_id: string | null;
    confidence_score: number | null;
    updated_at: string | null;
    is_account: boolean | null;
    is_spam: boolean | null;
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

// ============================================
// DELETION REQUEST (Main tracking table)
// ============================================
export interface DeletionRequest {
    // ===== Core IDs =====
    id: string
    user_id: string
    user_service_id: string

    // ===== Email Tracking =====
    sender_email: string | null        // User's email
    receiver_email: string | null      // Service's contact email
    gmail_message_id: string | null    // For Gmail API tracking
    thread_id: string | null
    template_used: string | null       // Email body that was sent
    last_reply_at: string | null;
    last_reply_snippet: string | null;

    // ===== Status & Method =====
    status: DeletionStatus             // Current status
    deletion_method: 'email' | 'link' | 'manual'

    // ===== Timestamps =====
    sent_at: string | null             // When email was sent
    completed_at: string | null        // When user marked complete
    created_at: string                 // When request created
    updated_at: string                 // Last update

    // ===== Follow-ups =====
    follow_up_count: number            // How many follow-ups sent (0-3)
    next_follow_up_at: string | null      // When to send next follow-up

    // ===== User Notes =====
    user_notes: string | null          // User's free-form notes
}


// ============================================
// SERVICE DELETION PLAYBOOK (Instructions)
// ============================================
export interface ServiceDeletionPlaybook {
    // ===== Core =====
    id: string
    service_id: string

    // ===== Deletion Info =====
    deletion_method: DeletionMethod
    deletion_url: string | null        // URL to deletion page
    deletion_email: string | null      // Contact email for deletion
    steps: string[]                    // Step-by-step instructions

    // ===== Metadata =====
    deletion_difficulty: 'easy' | 'medium' | 'hard' | null
    notes: string | null              

    // ===== Timestamps =====
    created_at: string
    updated_at: string

    data_deletion_info: 'deletes_data' | 'archives_data' | 'unclear' | null
    confidence:number | null
}

export interface Breach {
    id: string;
    created_at: string;
    domain: string | null;
    breach_date: string | null;
    data_classes: string[] | null;
    is_sensitive: boolean | null;
    pwn_count: number | null;
    raw: Record<string, string | number | boolean>;
    description: string | null
}

export interface UserBreach {
    id: string;
    user_id: string;
    email: string;
    service_id: string;
    breach_id: string;
    sweep_event_id: string | null;
    created_at: string;
}

export interface BulkDeletionRuns {
    id: string;
    created_at: string;
    user_id: string;
    status: "ready" | "running" | "done" | "cancelled";
    total_items: number;
    started_at: string | null;
    completed_at: string | null;
    email_count: number;
    link_count: number;
    manual_count: number;
    updated_at: string;
}

export interface BulkDeletionItems {
    id: string;
    user_id: string;
    run_id: string;
    deletion_request_id: string;
    status: "queued" | "processing" | "done" | "failed" | "skipped";
    sent_at: string | null;
    error: string | null;
    updated_at: string;
}

export type DeletionMethod = 'email' | 'link' | 'manual'