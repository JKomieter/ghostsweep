import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";


export default function useGetUser() {
    return useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}