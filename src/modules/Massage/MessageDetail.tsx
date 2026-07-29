"use client";

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Camera, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from "sonner";

interface MessageDetailClientProps {
  slug: string;
  token: string;
}

export function MessageDetailClient({ slug, token }: MessageDetailClientProps) {
  // Uses the prefetched data immediately
  const { data: messageData } = trpc.message.getMessageBySlug.useQuery({ slug });
  const [themeGradient, setThemeGradient] = useState<string | null>(null);

  if (!messageData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a202c] text-white gap-4">
        <p className="text-lg font-bold">Message not found or deleted.</p>
        <Link href={`/inbox?token=${token}`}>
          <Button className="rounded-full bg-white text-black font-bold">Back to Inbox</Button>
        </Link>
      </div>
    );
  }

  const getBackgroundGradient = (color?: string) => {
    if (themeGradient) return themeGradient;
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'from-blue-600 via-indigo-600 to-cyan-500';
      case 'purple':
        return 'from-purple-600 via-fuchsia-600 to-indigo-600';
      case 'emerald':
      case 'green':
        return 'from-emerald-500 via-teal-600 to-cyan-600';
      default:
        return 'from-pink-500 via-rose-500 to-orange-400';
    }
  };

  const cycleTheme = () => {
    const gradients = [
      'from-pink-500 via-rose-500 to-orange-400',
      'from-blue-600 via-indigo-600 to-cyan-500',
      'from-purple-600 via-fuchsia-600 to-indigo-600',
      'from-emerald-500 via-teal-600 to-cyan-600'
    ];
    const current = themeGradient || getBackgroundGradient(messageData.favoriteColor);
    const currentIndex = gradients.indexOf(current);
    const nextIndex = (currentIndex + 1) % gradients.length;
    setThemeGradient(gradients[nextIndex]);
  };

  const handleShareStory = (platform: string) => {
    toast.success(`Shared to ${platform} story preview!`);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-[#1a202c] p-6 text-white overflow-x-hidden">
      
      {/* Top Header Icons */}
      <header className="flex w-full max-w-sm items-center justify-between pt-2">
        <button className="text-zinc-400 hover:text-white transition-colors">
          <AlertTriangle size={22} />
        </button>

        <div className="flex items-center gap-3 bg-[#2d3748]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <button onClick={() => handleShareStory('Instagram')} className="hover:scale-110 transition-transform text-pink-400 font-bold text-sm">
            IG
          </button>
          <span className="text-zinc-600">•</span>
          <button onClick={() => handleShareStory('Snapchat')} className="hover:scale-110 transition-transform text-yellow-400 font-bold text-sm">
            SC
          </button>
          <span className="text-zinc-600">•</span>
          <button onClick={() => handleShareStory('WhatsApp')} className="hover:scale-110 transition-transform text-green-400 font-bold text-sm">
            WA
          </button>
        </div>

        {/* Updated Close Link to use token */}
        <Link href={`/inbox?token=${token}`}>
          <button className="rounded-full bg-[#2d3748] p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </Link>
      </header>

      {/* Main Card Section */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto gap-6">
        
        <div className="w-full flex flex-col rounded-3xl bg-[#1e2530] text-white shadow-2xl overflow-hidden border border-white/10">
          
          {/* Top Header Card Half (Dynamic User Color) */}
          <div className={cn("flex items-center justify-center p-8 bg-gradient-to-b text-center min-h-[140px] transition-colors duration-500", getBackgroundGradient(messageData.favoriteColor))}>
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              send me anonymous messages!
            </h2>
          </div>

          {/* Bottom Card Half (Message Body) */}
          <div className="p-8 text-center bg-[#1e2530] min-h-[120px] flex items-center justify-center">
            <p className="text-xl font-bold text-zinc-100 break-words">
              {messageData.promptContent}
            </p>
          </div>
        </div>

        {/* Customization Toggle Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={cycleTheme}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full bg-[#1a202c] flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400" />
            </div>
          </button>

          <button 
            onClick={() => toast.info("Snapshot capture ready!")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2d3748] border border-white/10 text-zinc-300 hover:text-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            <Camera size={20} />
          </button>
        </div>

        {/* Action CTA Buttons */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <Button 
            onClick={() => toast.info("Upgrade to reveal sender identity!")}
            className="h-14 w-full rounded-full bg-rose-500 hover:bg-rose-600 text-white text-lg font-black tracking-wide shadow-xl transition-transform active:scale-95 cursor-pointer"
          >
            Who sent this 👀
          </Button>

          {/* Updated Reply Link to use token */}
          <Link href={`/inbox/${slug}/reply?token=${token}`} className="w-full">
            <Button 
              className="h-14 w-full rounded-full bg-black hover:bg-zinc-900 text-white text-lg font-black tracking-wide shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <MessageCircle size={20} className="text-green-400 fill-green-400" />
              reply
            </Button>
          </Link>
        </div>

      </div>

      <div className="pb-2" />
    </main>
  );
}