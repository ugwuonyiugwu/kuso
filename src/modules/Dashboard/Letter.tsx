"use client";

import React from 'react';
import { trpc } from '@/trpc/client';
import Link from 'next/link';

interface LetterPageClientProps {
  username: string;
  letterType: string;
  title: string;
}

export function LetterPageClient({ username, letterType, title }: LetterPageClientProps) {
  // Fetch user data
  const [user] = trpc.user.getUserByUsername.useSuspenseQuery({ username });

  // Fetch frames from backend
  const [items = []] = trpc.frame.getByType.useSuspenseQuery({ type: letterType });

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-2 text-white">
      {/* Compact App Header */}
      <header className="flex w-full items-center justify-between pt-2 pb-3 px-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/${username}`} className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
            &larr; Back
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-sm font-black capitalize tracking-wider text-amber-400 truncate max-w-45">{title}</h1>
        </div>
      </header>

      {/* Pure 3-Column Image Gallery Grid */}
      <div className="w-full grid grid-cols-3 gap-1.5 pb-12">
        {items.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center p-8 rounded-sm bg-[#2d3748]/50 border border-white/10 text-center text-zinc-400 text-xs">
            <p>No templates available for {title.toLowerCase()} yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <Link 
              key={item.id} 
              href={`/${username}/letter/${letterType}/edit/${item.id}`}
              className="group relative flex flex-col overflow-hidden bg-[#2d3748]/90 border border-white/15 shadow-md transition-all active:scale-95 cursor-pointer hover:border-amber-400"
            >
              {/* Template Image Frame Container */}
              <div className="relative w-full aspect-3/4 bg-black/60 overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || "Template frame"} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-500 text-center p-2">
                    No Image
                  </div>
                )}
                
                {/* Subtle Selection Overlay on Hover/Tap */}
                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <span className="bg-black/80 backdrop-blur-md text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 shadow">
                    Edit & Customize
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}