import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./utils"
import { toast } from "sonner"

export type SyncStatusEnum = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";

export interface SyncStatusResponse {
    id: string;
    user_id: string;
    platform: string;
    status: SyncStatusEnum;
    error_message?: string | null;
    data_updated?: Record<string, any> | Record<string, any>[] | null;
    last_synced_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface SyncStatusCreate {
    platform: string;
    data_updated?: Record<string, any> | null;
}

export interface SyncStatusBulkCreate {
    platforms: string[];
    data_updated?: Record<string, any> | null;
}

export const useFetchAllSyncStatuses = () => {
    return useQuery<SyncStatusResponse[]>({
        queryKey: ["syncStatuses"],
        queryFn: async () => {
            const response = await api.get("/sync-status/")
            return response.data
        },
    })
}

export const useFetchPlatformSyncStatus = (platform: string) => {
    return useQuery<SyncStatusResponse>({
        queryKey: ["syncStatus", platform],
        queryFn: async () => {
            const response = await api.get(`/sync-status/${platform}`)
            return response.data
        },
        enabled: !!platform,
    })
}

export const useSetAsSynced = () => {
    const queryClient = useQueryClient();

    return useMutation<SyncStatusResponse, Error, string>({
        mutationFn: async (platform: string) => {
            // Note: The backend route is defined as @router.get("set-as-synced/{platform}")
            // Typically prefix="/sync-status" implies the full route is "/sync-status/set-as-synced/{platform}"
            const response = await api.get(`/sync-status/set-as-synced/${platform}`)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(`Successfully marked ${data.platform} as synced.`);
            queryClient.invalidateQueries({ queryKey: ["syncStatuses"] });
            queryClient.invalidateQueries({ queryKey: ["syncStatus", data.platform] });
        },
        onError: (error: any) => {
            const errorMsg = error?.response?.data?.detail || error.message || "Failed to mark as synced";
            toast.error(errorMsg);
        }
    })
}

export const useAddPendingSync = () => {
    const queryClient = useQueryClient();

    return useMutation<SyncStatusResponse, Error, SyncStatusCreate>({
        mutationFn: async (syncData: SyncStatusCreate) => {
            const response = await api.post("/sync-status/", syncData)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(`Queued ${data.platform} for synchronization.`);
            queryClient.invalidateQueries({ queryKey: ["syncStatuses"] });
            queryClient.invalidateQueries({ queryKey: ["syncStatus", data.platform] });
        },
        onError: (error: any) => {
            const errorMsg = error?.response?.data?.detail || error.message || "Failed to queue sync update";
            toast.error(errorMsg);
        }
    })
}

export const useAddPendingBulkSync = () => {
    const queryClient = useQueryClient();

    return useMutation<SyncStatusResponse[], Error, SyncStatusBulkCreate>({
        mutationFn: async (bulkData: SyncStatusBulkCreate) => {
            const response = await api.post("/sync-status/bulk", bulkData)
            return response.data
        },
        onSuccess: (data) => {
            toast.success(`Queued updates for ${data.length} platforms. Sync is pending.`);
            queryClient.invalidateQueries({ queryKey: ["syncStatuses"] });
            data.forEach((status) => {
                queryClient.invalidateQueries({ queryKey: ["syncStatus", status.platform] });
            });
        },
        onError: (error: any) => {
            const errorMsg = error?.response?.data?.detail || error.message || "Failed to queue bulk sync update";
            toast.error(errorMsg);
        }
    })
}