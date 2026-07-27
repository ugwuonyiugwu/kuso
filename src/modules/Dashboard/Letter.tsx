"use client";

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Edit3, ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

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

  // Local state using string keys mapped from numeric frame IDs
  const [editableContent, setEditableContent] = useState<Record<string, string>>({});
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  const handleTextChange = (id: number, text: string) => {
    const key = String(id);
    setEditableContent((prev) => ({ ...prev, [key]: text }));
  };

  const adjustPosition = (id: number, direction: 'up' | 'down') => {
    const key = String(id);
    setOffsets((prev) => {
      const current = prev[key] || 0;
      const step = 15;
      return { ...prev, [key]: direction === 'up' ? current - step : current + step };
    });
  };

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

      {/* Strict 3-Column Mobile Grid Container */}
      <div className="w-full grid grid-cols-3 gap-1.5 pb-12">
        {items.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center p-8 rounded-sm bg-[#2d3748]/50 border border-white/10 text-center text-zinc-400 text-xs">
            <p>No templates available for {title.toLowerCase()} yet.</p>
          </div>
        ) : (
          items.map((item, index) => {
            const itemKey = String(item.id);
            const currentText = editableContent[itemKey] ?? item.content ?? "";
            const currentOffset = offsets[itemKey] ?? 0;

            return (
              <div 
                key={item.id} 
                className="flex flex-col justify-between bg-[#2d3748]/90 border border-white/15 overflow-hidden shadow-md backdrop-blur-md"
              >
                {/* Miniature Visual Frame Container */}
                <div className="relative p-1.5 bg-black/40 border-b border-white/10 flex flex-col items-center justify-center h-28 overflow-hidden">
                  <div className="absolute top-1 left-1 z-10 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-bold text-amber-400 border border-white/10">
                    #{index + 1}
                  </div>

                  {/* Repositionable Content Element */}
                  <div 
                    style={{ transform: `translateY(${currentOffset}px)` }}
                    className="w-full transition-transform duration-200 flex flex-col items-center gap-1 my-1"
                  >
                    {item.imageUrl && (
                      <div className="w-full h-12 overflow-hidden rounded border border-white/10 bg-black/50">
                        <img src={item.imageUrl} alt={item.title || "Frame preview"} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="w-full bg-zinc-900/90 border border-white/10 rounded p-1 text-[9px] text-zinc-200 shadow-inner">
                      <p className="line-clamp-2 italic opacity-80 leading-tight">{currentText}</p>
                    </div>
                  </div>

                  {/* Micro Position Shift Controls */}
                  <div className="absolute bottom-1 right-1 z-10 flex items-center gap-0.5 bg-black/70 backdrop-blur-md p-0.5 rounded border border-white/10">
                    <button 
                      onClick={() => adjustPosition(item.id, 'up')}
                      title="Move up"
                      className="p-1 rounded hover:bg-white/20 text-zinc-300 transition-colors"
                    >
                      <ArrowUp size={10} />
                    </button>
                    <button 
                      onClick={() => adjustPosition(item.id, 'down')}
                      title="Move down"
                      className="p-1 rounded hover:bg-white/20 text-zinc-300 transition-colors"
                    >
                      <ArrowDown size={10} />
                    </button>
                  </div>
                </div>

                {/* Micro Editable Text Section */}
                <div className="p-2 flex flex-col gap-1.5 flex-1 justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-[9px] font-semibold text-zinc-400 gap-1">
                      <Edit3 size={10} className="text-amber-400" />
                      <span className="truncate">Edit</span>
                    </div>
                    <textarea
                      value={currentText}
                      onChange={(e) => handleTextChange(item.id, e.target.value)}
                      rows={2}
                      className="w-full rounded bg-black/40 border border-white/10 p-1 text-[9px] text-white focus:outline-none focus:border-amber-400/50 resize-none transition-colors"
                      placeholder="Type message..."
                    />
                  </div>

                  {/* Micro Action Button */}
                  <Button 
                    onClick={() => {
                      alert(`Letter ready to send!`);
                    }}
                    className="w-full h-6 rounded bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[9px] tracking-wide shadow transition-transform active:scale-95"
                  >
                    Select
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}