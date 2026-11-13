import { useQuery } from "@tanstack/react-query";

export type CurrentUser = { id: string; email: string | null };

// Session cookies are HttpOnly, so the signed-in user comes from the server
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
    const res = await fetch("/api/auth/user");
    if (!res.ok) return null;
    const body = (await res.json()) as { user: CurrentUser | null };
    return body.user;
}

export default function useGetUser() {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: fetchCurrentUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
