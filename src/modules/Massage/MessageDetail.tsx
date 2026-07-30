"use client";

import React, { useState, useRef } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Camera, AlertTriangle, X } from 'lucide-react';
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
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!messageData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a202c] text-white gap-4">
        <p className="text-lg font-bold">Message not found or deleted.</p>
        <Link href={`/${token}/inbox`}>
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

  const handleShareAsImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsSharing(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");

      canvas.width = 1200;
      canvas.height = 1400;

      // Draw background color
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw card container box with rounded corners
      ctx.fillStyle = '#1e2530';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(100, 150, 1000, 1000, 48);
        ctx.fill();
      } else {
        ctx.fillRect(100, 150, 1000, 1000);
      }

      // Draw top gradient banner header inside card
      // We simulate gradient block or solid primary accent
      const gradient = ctx.createLinearGradient(100, 150, 1100, 550);
      gradient.addColorStop(0, '#ec4899'); // pink-500
      gradient.addColorStop(0.5, '#f43f5e'); // rose-500
      gradient.addColorStop(1, '#fb923c'); // orange-400
      
      ctx.fillStyle = gradient;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(100, 150, 1000, 400, [48, 48, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(100, 150, 1000, 400);
      }

      // Header text inside banner
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("send me anonymous messages!", 600, 350);

      // Message body text inside bottom card half
      ctx.fillStyle = '#f4f4f5'; // zinc-100
      ctx.font = 'bold 46px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const textToDraw = messageData.promptContent || "";
      const maxWidth = 840;
      const words = textToDraw.split(' ');
      let line = '';
      const lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const lineHeight = 64;
      const startY = 700;

      lines.forEach((l, index) => {
        ctx.fillText(l.trim(), 600, startY + (index * lineHeight));
      });

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `anonymous-message.png`, { type: "image/png" });

      const shareMessage = `Check out this anonymous message I received!`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Anonymous Message',
          text: shareMessage,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `anonymous-message.png`;
        link.href = dataUrl;
        link.click();
        
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error("Error generating native image:", error);
      toast.error("Could not generate image share.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-[#1a202c] p-6 text-white overflow-x-hidden">
      
      {/* Top Header Icons */}
      <header className="flex w-full max-w-sm items-center justify-between px-4 pt-2">
        {/* Updated Close Link to use clean token route */}
        <Link href={`/${token}/inbox`}>
          <button className="rounded-full bg-[#2d3748] p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </Link>


         {/* Customization & Share Image Buttons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={cycleTheme}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-tr from-pink-500 via-purple-500 to-cyan-400 shadow-lg hover:scale-105 transition-transform cursor-pointer"
            title="Cycle Theme"
          >
            <div className="h-10 w-10 rounded-full bg-[#1a202c] flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-linear-to-tr from-pink-500 to-orange-400" />
            </div>
          </button>

          <button 
            onClick={handleShareAsImage}
            disabled={isSharing}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2d3748] border border-white/10 text-zinc-300 hover:text-white shadow-lg hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
            title="Download / Share Snapshot"
          >
            <Camera size={20} />
          </button>
        </div>
      </header>



      {/* Main Card Section */}
      <div className="w-full max-w-sm flex flex-col items-center my-auto gap-6">
        
        <div 
          ref={cardRef}
          className="w-full flex flex-col rounded-3xl bg-[#1e2530] text-white shadow-2xl overflow-hidden border border-white/10"
        >
          
          {/* Top Header Card Half (Dynamic User Color) */}
          <div className={cn("flex items-center justify-center p-8 bg-linear-to-b text-center min-h-35 transition-colors duration-500", getBackgroundGradient(messageData.favoriteColor))}>
            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
              Send me anonymous messages!
            </h2>
          </div>

          {/* Bottom Card Half (Message Body) */}
          <div className="p-8 text-center bg-[#1e2530] min-h-30 flex items-center justify-center">
            <p className="text-xl font-bold text-zinc-100 wrap-break-word">
              {messageData.promptContent}
            </p>
          </div>
        </div>

       
      </div>

      <div className="pb-2" />
    </main>
  );
}