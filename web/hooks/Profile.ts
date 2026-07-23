import { api } from "./utils"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

const useResumeUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.post("/uplaod-pdf", formData)
      return response.data
    },
    onSuccess: () => {
      toast.success("Resume uploaded successfully")
    },
    onError: (error: any) => {
      toast.error("Failed to upload resume")
      console.log("error in uploading resume:", error)
    },
  })
}

export default useResumeUpload