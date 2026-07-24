"use client";

import { PageTransition } from "@/components/animations/PageTransition";
import { ProfileLoader } from "@/components/Animated-Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import  {useResumeUpload, useJobStatus } from "@/hooks/Profile";
import { UploadCloud, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ResumeUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  
  const resumeUpload = useResumeUpload(); 
  const jobStatus = useJobStatus(jobId);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (jobStatus.data?.status === "COMPLETED") {
      // The backend has processed the resume. 
      // Invalidate the profile query so that layout fetches the new profile.
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }).then(() => {
        router.push("/dashboard");
      });
    }
  }, [jobStatus.data?.status, router, queryClient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    resumeUpload.mutate(file, {
      onSuccess: (data: any) => {
        if (data.job_id) {
          setJobId(data.job_id);
        } else {
          router.push("/dashboard");
        }
      }
    });
  };

  const isProcessing = resumeUpload.isPending || (jobId && jobStatus.data?.status !== "COMPLETED");

  if (isProcessing) {
    return (
      <PageTransition className="flex-1 flex flex-col min-h-[100dvh] items-center justify-center">
        <ProfileLoader />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="flex-1 flex flex-col min-h-[100dvh] max-w-4xl mx-auto w-full p-8">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="space-y-2 mb-10">
          <h1 className="text-4xl font-heading font-medium text-primary">Import your Resume</h1>
          <p className="text-muted-foreground font-light text-lg">
            Upload your existing resume to instantly build your master profile.
          </p>
        </div>

        <Card className="flex-1 flex flex-col items-center justify-center p-12 border-dashed border-2 rounded-none bg-card/50">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <UploadCloud className="w-10 h-10 text-primary" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-medium mb-2">Drag and drop your file here</h3>
          <p className="text-muted-foreground mb-8">Supports PDF, DOCX up to 10MB</p>
          
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              accept=".pdf,.docx" 
              className="max-w-[250px] cursor-pointer"
              onChange={handleFileChange}
            />
            <Button 
              onClick={handleUpload} 
              disabled={!file}
              className="rounded-none px-8"
            >
              Upload
            </Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
