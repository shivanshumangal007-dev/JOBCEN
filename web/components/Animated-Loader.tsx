"use client"

import { useEffect, useState } from "react"

const STATUS_MESSAGES = [
  "Fetching your profile",
  "Gathering your career history",
  "Assembling your updates",
  "Almost there",
]

export function ProfileLoader() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-8 bg-white">
      {/* Signature mark — a single line that draws itself in a slow loop.
          Restrained, one motion element, nothing else moving around it. */}
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="36"
          cy="36"
          r="30"
          stroke="#1A1A1A"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="188.5"
          strokeDashoffset="0"
          className="animate-loader-draw"
        />
      </svg>

      <div className="relative h-7 w-full overflow-hidden">
        <p
          key={messageIndex}
          className="animate-loader-text-in text-sm tracking-[0.14em] uppercase text-[#1A1A1A]/70"
          style={{ fontFamily: "var(--font-body, Inter, sans-serif)" }}
        >
          {STATUS_MESSAGES[messageIndex]}
        </p>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {STATUS_MESSAGES[messageIndex]}, please wait
      </span>

      <style jsx global>{`
        @keyframes loader-draw {
          0% {
            stroke-dashoffset: 188.5;
            transform: rotate(0deg);
          }
          50% {
            stroke-dashoffset: 47;
          }
          100% {
            stroke-dashoffset: 188.5;
            transform: rotate(360deg);
          }
        }
        .animate-loader-draw {
          transform-origin: center;
          animation: loader-draw 2.4s ease-in-out infinite;
        }

        @keyframes loader-text-in {
          from {
            opacity: 0;
            transform: translate(-50%, 8px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-loader-text-in {
          animation: loader-text-in 0.5s ease-out forwards;
          position: absolute;
          left: 50%;
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-loader-draw,
          .animate-loader-text-in {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}