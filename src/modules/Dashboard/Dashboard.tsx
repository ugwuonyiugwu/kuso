"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check, Menu, Sparkles, Share2, Gift, Calendar, PartyPopper, Settings, Upload, Edit3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from '@/trpc/client';
import Link from 'next/link';

interface DashboardClientProps {
  token: string;
}

export function DashboardClient({ token }: DashboardClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileLink, setProfileLink] = useState('');
  
  // States for editable card prompt message
  const [cardMessage, setCardMessage] = useState('Anonymous messages!');
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: user, error, isLoading, refetch } = trpc.user.getUserByToken.useQuery(
    { token },
    { enabled: isMounted && Boolean(token) }
  );

  // tRPC mutation to create a new message row in PostgreSQL when prompt updates
  const updatePromptMutation = trpc.user.updatePrompt.useMutation({
    onSuccess: (data: any) => {
      refetch();
      // If your backend returns the new slug/message record, update the link to point to it directly:
      if (data?.slug && typeof window !== 'undefined') {
        setProfileLink(`${window.location.origin}/${data.slug}`);
      }
    },
  });

  // Sync state with user data from the database once loaded
  useEffect(() => {
    if (user) {
      if (user.customPrompt) {
        setCardMessage(user.customPrompt);
      }
      if (typeof window !== 'undefined') {
        // Default to base secretToken link on initial load
        const baseUrl = `${window.location.origin}/${user.secretToken}`;
        setProfileLink(baseUrl);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white p-6">
        <div className="text-center rounded-3xl bg-black/40 p-8 border border-red-500/20 max-w-sm w-full">
          <h1 className="text-xl font-bold text-red-400 mb-2">Unauthorized Access</h1>
          <p className="text-xs text-zinc-400">You need a valid secure token to view this dashboard. Please log in again.</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(profileLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(profileLink);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
      <header className="flex w-full max-w-sm items-center justify-between pt-2 pb-6 my-3 mb-8">
        <div className="flex gap-4">
          <Link 
            href={`/dashboard?token=${token}`}
            className="text-xl font-black tracking-wider text-white underline decoration-white decoration-2 underline-offset-8"
          >
            play
          </Link>
          <Link 
            href={`/${token}/inbox`}
            className="text-xl font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            inbox
          </Link>
        </div>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Menu size={22} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#1e2533]/95 border border-white/10 p-1.5 shadow-2xl backdrop-blur-xl z-50 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
              <Link 
                href={`/${token}/letter/birthday-wishes`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Gift size={16} className="text-pink-400" />
                Birthday letters
              </Link>
              <Link 
                href={`/${token}/letter/new-month-wishes`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Calendar size={16} className="text-blue-400" />
                New month letters
              </Link>
              <Link 
                href={`/${token}/letter/new-year-wishes`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <PartyPopper size={16} className="text-purple-400" />
                New year letters
              </Link>
              <Link 
                href={`/${token}/letter/letters`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <PartyPopper size={16} className="text-purple-400" />
                letter templates
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link 
                    href={`/${token}/admin/upload`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-colors"
                  >
                    <Upload size={16} className="text-amber-400" />
                    Upload
                  </Link>
                  <Link 
                    href={`/create?token=${token}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-colors"
                  >
                    <Upload size={16} className="text-amber-400" />
                    create
                  </Link>
                  <Link 
                    href={`/setting?token=${token}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-amber-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Settings size={16} className="text-amber-400" />
                    Setting
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="flex w-full max-w-sm flex-1 flex-col gap-4 pb-8">
        {/* Editable Message Card Preview */}
        <div className={cn(
          "relative flex flex-col items-center justify-center rounded-3xl border-2 bg-black/40 p-6 text-center backdrop-blur-md transition-all",
          getColorGlowStyles(user?.favoriteColor)
        )}>
          <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg">
            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-2xl font-bold">
              {user.username ? user.username[0].toUpperCase() : "K"}
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white px-2">
            {cardMessage}
          </h2>

          <button 
            onClick={() => setIsEditingMessage(!isEditingMessage)}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all"
            title="Edit prompt message"
          >
            {isEditingMessage ? <X size={16} className="text-white" /> : <Edit3 size={16} className="text-white" />}
          </button>
        </div>

        {/* Edit Panel Drawer */}
        {isEditingMessage && (
          <div className="flex flex-col gap-2.5 rounded-2xl bg-[#2d3748] p-4 border border-white/10 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-xs font-semibold text-zinc-300">Customize Prompt Message:</label>
            <textarea 
              value={cardMessage}
              onChange={(e) => setCardMessage(e.target.value)}
              placeholder="e.g. Send me a beautiful picture, send your thoughts..."
              rows={2}
              className="w-full bg-black/30 border border-white/10 text-white p-2.5 rounded-xl text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white resize-none"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button 
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCardMessage('Anonymous messages!');
                }}
                className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-white/10"
              >
                Reset
              </Button>
              <Button 
                size="sm"
                disabled={updatePromptMutation.isPending}
                onClick={() => {
                  setIsEditingMessage(false);
                  updatePromptMutation.mutate({ token, prompt: cardMessage });
                }}
                className="h-8 text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-semibold rounded-lg px-4"
              >
                {updatePromptMutation.isPending ? "Saving..." : "Done"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center rounded-3xl bg-[#2d3748]/80 p-5 border border-white/10 shadow-lg">
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

        <div className="flex flex-col items-center justify-center rounded-3xl bg-[#2d3748]/80 p-5 border border-white/10 shadow-lg">
          <span className="text-sm font-semibold text-zinc-400 mb-3">Step 2: Share link on your story</span>
          
          <Button 
            onClick={handleWhatsAppShare}
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