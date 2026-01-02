import { UserService, Service, DeletionRequest, UserBreach, Breach, ServiceDeletionPlaybook, Plan, DeletionMethod } from "./types";


export interface UserServicesQueryResult {
    userServices: Array<Partial<UserService> & { service: Service, deletion_request: DeletionRequest | null }> | null;
    total: number
    page: number,
    pageSize: number,
    hasMore: boolean,
    gated: boolean,
    currentPlan: Plan,
    hiddenCount: number
    freeLimit: number
    shownCount: number
}

export type DeletionRequestListRow = Pick<
    DeletionRequest,
    | "id"
    | "status"
    | "deletion_method"
    | "sender_email"
    | "receiver_email"
    | "sent_at"
    | "completed_at"
    | "created_at"
    | "updated_at"
    | "last_reply_at"
    | "last_reply_snippet"
    | "follow_up_count"
    | "next_follow_up_at"
    | "user_notes"
    | "gmail_message_id"
    | "thread_id"
> & {
    user_service: Pick<UserService, "id" | "service_id"> & {
        service: Pick<Service, "id" | "name" | "domain" | "logo_url" | "category" | "is_breached">;
    };
};

export interface DeletionRequestsQueryResult {
    requests: DeletionRequestListRow[];
    total: number;
    page: number;
    pageSize: number;
}

export interface UserServiceDetailsQueryResult {
    userService: UserService & { service: Service } | null;
    userBreaches: Array<UserBreach & { breach: Breach }> | null;
    deletionRequest: DeletionRequest | null
}

export interface DashboardMetricsQueryResult {
    service_count: number;
    breach_count: number;
    last_scan_date: string | null;
    pending_requests: number;
    responded_requests: number;
    security_score: {
        score: number | null;
        grade: string | null;
        last_calculated_at: string | null;
    };
}

export interface UserBreachesQueryResult {
    userBreaches: Array<UserBreach & { breach: Breach }> | null;
    total: number
    gated: boolean;
    currentPlan: Plan
}

export interface UserBreachDetailsQueryResult {
    userBreach: UserBreach & { breach: Breach | null, service: Service } | null;
    total: number;
}

export interface ServiceDeletionPlaybookQueryResult {
    playbook: ServiceDeletionPlaybook | null
}

export type Grouped = {
    playbook: Pick<ServiceDeletionPlaybook, "deletion_method" | "deletion_url" | "steps" | "deletion_email">;
    resolved_method: DeletionMethod;
    id: string;
    user_id: string;
    service_id: string;
    first_seen_at: string;
    last_seen_at: string;
    email_count: number;
    service: Pick<Service, "id" | "name" | "domain" | "category" | "logo_url">
}[]

export interface BulkUserServicesQueryResult {
    inputCount: number;
    foundCount: number;
    grouped: {
        email: Grouped;
        link: Grouped;
        manual: Grouped
    },
    counts: {
        email: number,
        link: number,
        manual: number,
        total: number,
    },
    missingIds: string[]
}