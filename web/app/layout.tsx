import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const fontHeading = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "JOBCEN",
  description: "Update your career profile in just one click.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans bg-background text-foreground",
        fontSans.variable,
        fontHeading.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
