"use client";

import React from 'react';
import { trpc } from '@/trpc/client';
import { MessageSquare, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface InboxClientProps {
  username: string;
}

export function InboxClient({ username }: InboxClientProps) {
  const { data: userMessages, isLoading } = trpc.message.getInbox.useQuery({ username });

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-6 text-white">
      {/* Header */}
      <header className="flex w-full max-w-sm items-center justify-between pt-2 pb-6">
        <div className="flex gap-4">
          <Link href={`/${username}`} className="text-xl font-bold text-zinc-500 hover:text-zinc-300">
            play
          </Link>
          <span className="text-xl font-black tracking-wider text-white underline decoration-white decoration-2 underline-offset-8">
            inbox
          </span>
        </div>
        <Link href={`/${username}`}>
          <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
      </header>

      {/* Content Container */}
      <div className="flex w-full max-w-sm flex-1 flex-col gap-4 pb-8">
        <div className="flex items-center justify-between rounded-2xl bg-[#2d3748]/80 p-4 border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Anonymous Messages</h2>
              <p className="text-xs text-zinc-400">@{username}'s secret inbox</p>
            </div>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-pink-400">
            {userMessages?.length || 0}
          </span>
        </div>

        {/* Messages List */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : userMessages && userMessages.length > 0 ? (
          <div className="flex flex-col gap-3">
            {userMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="flex flex-col gap-2 rounded-2xl bg-[#2d3748]/60 p-4 border border-white/10 shadow-md backdrop-blur-sm transition-all hover:bg-[#2d3748]"
              >
                <p className="text-base font-medium text-zinc-100 break-words">{msg.content}</p>
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