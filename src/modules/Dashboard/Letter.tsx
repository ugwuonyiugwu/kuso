"use client";

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface LetterPageClientProps {
  username: string;
  letterType: string;
  title: string;
}

export function LetterPageClient({ username, letterType, title }: LetterPageClientProps) {
  const [user] = trpc.user.getUserByUsername.useSuspenseQuery({ username });

  // State for the letters/frames loaded for the user (ready for future admin backend integration)
  const [items] = useState<Array<{ id: string; content: string; imageUrl?: string }>>([
    { id: '1', content: `Admin uploaded ${letterType} note #1 for you...`, imageUrl: '' },
    { id: '2', content: `Admin uploaded ${letterType} note #2 for you...`, imageUrl: '' },
    { id: '3', content: `Admin uploaded ${letterType} note #3 for you...`, imageUrl: '' },
  ]);

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-6 text-white">
      <header className="flex w-full max-w-4xl items-center justify-between pt-2 pb-6 mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${username}`} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
            &larr; Back to Dashboard
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-xl font-black capitalize tracking-wider text-white">{title}</h1>
        </div>
      </header>

      {/* Three Column Grid Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="flex flex-col justify-between rounded-3xl bg-[#2d3748]/70 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-white/20"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span className="text-pink-400 font-bold">Frame #{index + 1}</span>
              </div>

              {/* Display Content Frame */}
              <div className="w-full h-32 bg-black/30 border border-white/10 rounded-2xl p-3 text-sm text-zinc-100 overflow-y-auto">
                {item.content}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <ImageIcon size={14} className="text-pink-400" />
                <span>No image attached</span>
              </span>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full capitalize">{letterType}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}