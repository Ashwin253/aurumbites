"use client";

import { useState } from "react";

export default function SocialShareButtons({ title, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: title || "Aurum Bites",
      text: `Check out ${title || "this product"} on Aurum Bites`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.warn("Error sharing:", error);
      }
    } else {
      // Fallback: Copy link
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-full border border-[#e9dfcf] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 transition hover:bg-neutral-50 hover:text-[#7a5a26] shadow-sm sm:px-4 sm:py-2.5"
        aria-label="Share product"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 5.314l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        <span className="hidden sm:inline">Share Product</span>
        <span className="sm:hidden">Share</span>
      </button>

      {copied && (
        <span className="rounded-lg bg-neutral-900 px-3 py-1.5 text-[10px] font-semibold text-white animate-fade-in shadow-md">
          Link copied!
        </span>
      )}
    </div>
  );
}
