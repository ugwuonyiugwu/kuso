"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check, Settings, Sparkles, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from '@/trpc/client';
import Link from 'next/link';

interface DashboardClientProps {
  username: string;
}

export function DashboardClient({ username }: DashboardClientProps) {
  const [copied, setCopied] = useState(false);

  // Use the actual current window origin (your live Vercel domain) automatically!
  const profileLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/${username}` 
    : `/${username}`;

  // Uses suspense query which automatically hooks into the server prefetch
  const [user] = trpc.user.getUserByUsername.useSuspenseQuery({ username });

  const handleCopy = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getColorGlowStyles = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'pink':
        return 'from-pink-500 to-rose-500 shadow-[0_0_35px_rgba(236,72,153,0.4)] border-pink-400/50';
      case 'blue':
        return 'from-blue-500 to-cyan-500 shadow-[0_0_35px_rgba(59,130,246,0.4)] border-blue-400/50';
      case 'purple':
        return 'from-purple-500 to-indigo-500 shadow-[0_0_35px_rgba(168,85,247,0.4)] border-purple-400/50';
      default:
        return 'from-pink-500 to-orange-500 shadow-[0_0_35px_rgba(236,72,153,0.4)] border-pink-400/50';
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-6 text-white">
      <header className="flex w-full max-w-sm items-center justify-between pt-2 pb-6">
        <div className="flex gap-4">
          <span className="text-xl font-black tracking-wider text-white underline decoration-white decoration-2 underline-offset-8">
            play
          </span>
          <Link 
            href={`/${username}/inbox`} 
            className="text-xl font-bold text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors"
          >
            inbox
          </Link>
        </div>
        <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
          <Settings size={22} />
        </button>
      </header>

      <div className="flex w-full max-w-sm flex-1 flex-col gap-4 pb-8">
        <div className={cn(
          "relative flex flex-col items-center justify-center rounded-3xl border-2 bg-black/40 p-6 text-center backdrop-blur-md transition-all",
          getColorGlowStyles(user?.favoriteColor)
        )}>
          <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl font-bold">
              {username ? username[0].toUpperCase() : "K"}
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white">
            send me anonymous messages!
          </h2>

          <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm cursor-pointer hover:bg-white/20">
            <Sparkles size={16} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl bg-[#2d3748]/80 p-5 border border-white/10 shadow-lg flex-1">
          <span className="text-sm font-semibold text-zinc-400 mb-1">Step 1: Copy your link</span>
          <span className="text-xs font-bold tracking-wide text-zinc-200 mb-3 break-all text-center">{profileLink}</span>
          
          <Button 
            onClick={handleCopy}
            className={cn(
              "h-12 w-full rounded-full bg-linear-to-r text-base font-bold text-white shadow-md transition-transform active:scale-95",
              getColorGlowStyles(user?.favoriteColor)
            )}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" /> copy link
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl bg-[#2d3748]/80 p-5 border border-white/10 shadow-lg flex-1">
          <span className="text-sm font-semibold text-zinc-400 mb-3">Step 2: Share link on your story</span>
          
          <Button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'KUSO', text: 'Send me anonymous messages!', url: profileLink });
              } else {
                handleCopy();
              }
            }}
            className={cn(
              "h-12 w-full rounded-full bg-linear-to-r text-base font-extrabold text-white shadow-lg transition-transform active:scale-95 hover:opacity-90",
              getColorGlowStyles(user?.favoriteColor)
            )}
          >
            <Share2 className="mr-2 h-5 w-5" /> Share!
          </Button>
        </div>
      </div>
    </main>
  );
}