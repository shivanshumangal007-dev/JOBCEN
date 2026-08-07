import { ProfileUpdate } from "@/store/useStore";
import { toast } from "sonner";
// import { UniversalProfile } from "./Profile"

const EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID || "epfdffedmblijieeohbdkfpnfepbdlbo";

export async function useUpdateOnWellfound(updateData: ProfileUpdate[]): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).chrome?.runtime) {
    toast.error("Install the JOBCEN extension to sync your profile");
    return false;
  }
  const chrome = (window as any).chrome;
  
  let successCount = 0;
  for (const update of updateData) {
    try {
      console.log(`[Frontend] Sending SYNC_TO_PLATFORM to extension ${EXTENSION_ID}...`);
      const response = await new Promise<any>((resolve, reject) => {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { action: "SYNC_TO_PLATFORM", platform: "wellfound", data: update },
          (response: any) => {
            if (chrome.runtime.lastError) {
              console.error("[Frontend] Extension sendMessage error:", chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
              return;
            }
            console.log("[Frontend] Extension response:", response);
            resolve(response);
          }
        );
      });
      
      if (response?.success) {
        successCount++;
      }
    } catch (error) {
      console.error(error);
      toast.error("Extension not found — please install it first");
      return false;
    }
  }
  
  if (updateData.length === 0) {
    toast.error("No updates found to sync.");
    return false;
  }
  
  if (successCount > 0) {
    toast.success("Opening Wellfound to sync your profile...");
    return true;
  }
  return false;
}
