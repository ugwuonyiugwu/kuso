"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Dices, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from '@/trpc/client';
import Link from 'next/link';

interface SendMessageClientProps {
  username: string;
  favoriteColor?: string;
}

export function SendMessageClient({ username, favoriteColor }: SendMessageClientProps) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setMessage('');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage.mutate({
      recipientUsername: username,
      content: message,
    });
  };

  const getRandomPrompt = () => {
    const prompts = [
      "are u single?",
      "what's your first impression of me?",
      "send a confession...",
      "what's a secret you've never told anyone?",
      "if we went on a date, where would we go?"
    ];
    setMessage(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  const getBackgroundGradient = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'blue':
        return 'from-blue-600 via-indigo-600 to-cyan-500';
      case 'purple':
        return 'from-purple-600 via-fuchsia-600 to-indigo-600';
      default:
        return 'from-pink-500 via-rose-500 to-orange-400';
    }
  };

  return (
    <main className={cn(
      "relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b p-6 text-white overflow-x-hidden",
      getBackgroundGradient(favoriteColor)
    )}>
      <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center my-auto gap-4">
        
        {submitted ? (
          <div className="w-full rounded-3xl bg-black/40 p-8 text-center backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center gap-4">
            <CheckCircle2 size={60} className="text-green-400" />
            <h2 className="text-2xl font-black tracking-tight">Message Sent!</h2>
            <p className="text-sm text-zinc-300">Your anonymous message was successfully delivered to @{username}.</p>
            <Button 
              onClick={() => setSubmitted(false)}
              className="mt-4 w-full rounded-full bg-white text-black font-extrabold hover:bg-zinc-200 h-12"
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="w-full flex flex-col gap-4">
            {/* Main Card */}
            <div className="relative flex flex-col rounded-3xl bg-white text-black shadow-2xl overflow-hidden border border-white/40">
              
              {/* User Header */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-100 bg-white">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {username[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-zinc-900 text-sm">@{username}</span>
                  <span className="text-xs font-semibold text-zinc-500">send me anonymous messages!</span>
                </div>
              </div>

              {/* Text Input Area */}
              <div className={cn(
                "relative p-5 bg-gradient-to-b flex flex-col justify-between min-h-[180px]",
                getBackgroundGradient(favoriteColor)
              )}>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="are u single?"
                  maxLength={500}
                  className="w-full bg-transparent border-none text-white placeholder:text-white/70 text-lg font-medium resize-none focus-visible:ring-0 shadow-none p-0 min-h-[110px]"
                />

                {/* Dice Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={getRandomPrompt}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-transform active:scale-95 shadow-sm"
                  >
                    <Dices size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Lock text */}
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white/90 drop-shadow-sm my-1">
              <Lock size={13} className="text-amber-300 fill-amber-300" />
              <span>anonymous q&a</span>
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className="h-14 w-full rounded-full bg-black text-white text-lg font-black tracking-wide shadow-xl hover:bg-zinc-900 transition-transform active:scale-95 disabled:opacity-50"
            >
              {sendMessage.isPending ? "Sending..." : "Send!"}
            </Button>
          </form>
        )}

        {/* Bottom CTA to get their own link */}
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <span className="text-xs font-extrabold text-amber-300 drop-shadow-md">
            👇 249 friends just tapped the button 👇
          </span>
          <Link href="/register" className="w-full">
            <Button className="h-14 w-full rounded-full bg-black text-white text-base font-extrabold shadow-xl hover:bg-zinc-900 transition-transform active:scale-95">
              Get your own messages!
            </Button>
          </Link>
        </div>

      </div>

      <footer className="flex gap-4 text-xs font-bold text-white/80 pb-2">
        <Link href="/terms" className="hover:underline">Terms</Link>
        <span>•</span>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
      </footer>
    </main>
  );
}