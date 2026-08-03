import { useQuery } from "@tanstack/react-query"
import { api } from "./utils"

const usefetchPendingSync = () => {
    return useQuery({
        queryKey: ["pendingSync"],
        queryFn: async () => {
            const response = await api.get("/sync-status")
            return response.data
        },
    })
}