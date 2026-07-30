"use client";

import React, { useState, useRef, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { MessageSquare, Menu, Calendar, Sparkles, Gift, PartyPopper, Settings, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface InboxClientProps {
  token: string;
}

export function InboxClient({ token }: InboxClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user data and messages securely using the token
  const { data: user, isLoading: isUserLoading } = trpc.user.getUserByToken.useQuery({ token });
  const { data: userMessages, isLoading: isMessagesLoading } = trpc.message.getInbox.useQuery(
    { username: user?.username ?? "" },
    { enabled: !!user?.username }
  );

  // Close menu when clicking outside
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

  if (isUserLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-6 text-white">
      {/* Header */}
      <header className="flex w-full max-w-sm items-center justify-between pt-2 pb-6 mb-15 my-5">
        <div className="flex gap-4">
          <Link 
            href={`/${token}/dashboard`} 
            className="text-xl font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            play
          </Link>
          <Link 
            href={`/${token}/inbox`} 
            className="text-xl font-black tracking-wider text-white underline decoration-white decoration-2 underline-offset-8"
          >
            inbox
          </Link>
        </div>

        {/* Menu Container with Floating Dropdown */}
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
                href={`/${token}/letter/letter`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <PartyPopper size={16} className="text-purple-400" />
                Letter templates
              </Link>

              {user?.role === 'admin' && (
                <div>
                  <Link 
                    href={`/${token}/admin/upload`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-colors"
                  >
                    <Upload size={16} className="text-amber-400" />
                    Upload
                  </Link>
                  <Link 
                    href={`/${token}/create`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-amber-300 hover:bg-white/10 hover:text-amber-200 transition-colors"
                  >
                    <Upload size={16} className="text-amber-400" />
                    Create
                  </Link>
                </div>
              )}

              <div className="my-1 h-[1px] bg-white/10" />
              
              <Link 
                href={`/${token}/settings`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Settings size={16} className="text-zinc-400" />
                Setting
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Content Container */}
      <div className="flex w-full max-w-sm flex-1 flex-col gap-4 pb-8">
        <div className="flex items-center justify-between rounded-sm bg-[#2d3748]/80 p-4 border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Anonymous Messages</h2>
              <p className="text-xs text-zinc-400">@{user.username}&apos;s secret inbox</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-pink-400">
            {userMessages?.length || 0}
          </span>
        </div>

        {/* Messages List */}
        {isMessagesLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : userMessages && userMessages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {userMessages.map((msg) => (
              <Link key={msg.id} href={`/${token}/inbox/${msg.slug}`} className="block">
                <div 
                  className="flex flex-col gap-2 rounded-sm bg-[#2d3748]/60 p-4 border border-white/10 shadow-md backdrop-blur-sm transition-all hover:bg-[#2d3748] cursor-pointer"
                >
                  <p className="text-base font-medium text-zinc-100 wrap-break-words line-clamp-2 overflow-hidden text-ellipsis">
                    {msg.promptContent}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(msg.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-pink-400 font-semibold">
                      <Sparkles size={12} /> Anonymous
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#2d3748]/40 border border-white/5 gap-3 my-auto">
            <MessageSquare size={40} className="text-zinc-500" />
            <h3 className="text-base font-bold text-zinc-300">No messages yet</h3>
            <p className="text-xs text-zinc-400">Share your profile link on your social story to start receiving anonymous messages!</p>
          </div>
        )}
      </div>
    </main>
  );
}