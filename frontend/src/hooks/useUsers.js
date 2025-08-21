import { useQuery } from "@tanstack/react-query";
import api from "../api/apiClient";

export function useUsers(page, limit) {
    return useQuery({
        queryKey: ["users", page, limit],
        queryFn: async () => {
            const res = await api.get(`/users?page=${page}&limit=${limit}`);
            return res.data;
        },
        keepPreviousData: true
    });
}
