"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Dices, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { toast } from "sonner";

interface SendMessageClientProps {
  username: string;
  favoriteColor?: string;
  promptContent?: string; // Added to render your dynamic heading on the card
}

export function SendMessageClient({ username, favoriteColor, promptContent }: SendMessageClientProps) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate: sendMessage, isPending } = trpc.message.send.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setMessage('');
      toast.success("Anonymous message sent successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message. Try again!");
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessage({
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between bg-[#1a202c] p-6 text-white overflow-x-hidden">
      <div className="w-full max-w-sm flex flex-col items-center flex-1 justify-center my-auto gap-4">
        
        {submitted ? (
          <div className="w-full rounded-3xl bg-black/40 p-8 text-center backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center gap-4">
            <CheckCircle2 size={60} className="text-cyan-400" />
            <h2 className="text-2xl font-black tracking-tight">Message Sent!</h2>
            <p className="text-sm text-zinc-300">Your anonymous message was successfully delivered.</p>
            <Button 
              onClick={() => setSubmitted(false)}
              className="mt-4 w-full rounded-full bg-white text-black font-extrabold hover:bg-zinc-200 h-12 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="w-full flex flex-col gap-4">
            <div className="relative flex flex-col rounded-3xl bg-white text-black overflow-hidden border-2 border-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all">
              
              <div className="flex items-center gap-3 p-4 border-b border-zinc-100 bg-white">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-blue-400/30">
                  {username ? username[0].toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  {/* Dynamic card subheader showing the custom prompt/heading safely without leaking the full username handle */}
                  <span className="text-xs font-bold text-zinc-500 lowercase tracking-wider">
                    {promptContent || "send me anonymous messages!"}
                  </span>
                </div>
              </div>

              <div className="relative p-5 bg-[#2d3748] flex flex-col justify-between min-h-45">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="are u single?"
                  maxLength={500}
                  className="w-full bg-transparent border-none text-white placeholder:text-zinc-400 text-lg font-medium resize-none focus-visible:ring-0 shadow-none p-0 min-h-27.5"
                />

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={getRandomPrompt}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-transform active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Dices size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white/90 drop-shadow-sm my-1">
              <Lock size={13} className="text-cyan-300 fill-cyan-300" />
              <span>anonymous q&a</span>
            </div>

            <Button
              type="submit"
              disabled={!message.trim() || isPending}
              className="h-14 w-full rounded-full bg-black text-white text-lg font-black tracking-wide shadow-xl hover:bg-zinc-900 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer border border-white/10"
            >
              {isPending ? "Sending..." : "Send!"}
            </Button>
          </form>
        )}

        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <span className="text-xs font-extrabold text-cyan-300 drop-shadow-md">
            👇 249 friends just tapped the button 👇
          </span>
          <Link href="/" className="w-full">
            <Button className="h-14 w-full rounded-full bg-black text-white text-base font-extrabold shadow-xl hover:bg-zinc-900 transition-transform active:scale-95 cursor-pointer border border-white/10">
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