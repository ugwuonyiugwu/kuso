"use client";

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Plus, Trash2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

interface EditFrameClientProps {
  username: string;
  letterType: string;
  frameId: string;
}

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
}

export function EditFrameClient({ username, letterType, frameId }: EditFrameClientProps) {
  // Consumes the prefetched server-side data instantly
  const [frame] = trpc.frame.getById.useSuspenseQuery({ id: Number(frameId) });

  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    { id: '1', text: 'New text', x: 50, y: 30 },
  ]);

  const [activeId, setActiveId] = useState<string | null>('1');

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: 'Tap to edit text',
      x: 50,
      y: 50,
    };
    setTextLayers([...textLayers, newLayer]);
    setActiveId(newLayer.id);
  };

  const updateText = (id: string, text: string) => {
    setTextLayers(textLayers.map(l => l.id === id ? { ...l, text } : l));
  };

  const deleteLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTextLayers(textLayers.filter(l => l.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 5;
    setTextLayers(textLayers.map(l => {
      if (l.id !== id) return l;
      let { x, y } = l;
      if (direction === 'up') y = Math.max(5, y - step);
      if (direction === 'down') y = Math.min(90, y + step);
      if (direction === 'left') x = Math.max(10, x - step);
      if (direction === 'right') x = Math.min(90, x + step);
      return { ...l, x, y };
    }));
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-3 text-white">
      <header className="flex w-full items-center justify-between pt-2 pb-3 px-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link href={`/${username}/letter/${letterType}`} className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1">
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-xs font-bold text-amber-400">Edit Card</h1>
        </div>
        <Button 
          onClick={() => alert("Card saved successfully!")}
          className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] rounded-lg"
        >
          <Check size={12} className="mr-1" /> Save & Send
        </Button>
      </header>

      {/* Main Canvas Area */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl my-2">
        {frame?.imageUrl && (
          <img src={frame.imageUrl} alt={frame.title} className="w-full h-full object-cover select-none pointer-events-none" />
        )}

        {textLayers.map((layer) => {
          const isActive = activeId === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => setActiveId(layer.id)}
              style={{ left: `${layer.x}%`, top: `${layer.y}%`, transform: 'translate(-50%, -50%)' }}
              className={`absolute cursor-pointer transition-all p-2 rounded-lg ${
                isActive ? 'border-2 border-white bg-black/60 shadow-xl scale-105' : 'border border-dashed border-white/40 bg-black/30'
              }`}
            >
              <p className="text-white font-medium text-center text-sm tracking-wide drop-shadow-md whitespace-nowrap">
                {layer.text}
              </p>

              {isActive && (
                <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/90 border border-white/20 p-1 rounded-md shadow-lg z-20">
                  <button onClick={() => moveLayer(layer.id, 'left')} className="p-1 hover:bg-white/20 rounded text-[10px]">◀</button>
                  <button onClick={() => moveLayer(layer.id, 'up')} className="p-1 hover:bg-white/20 rounded text-[10px]">▲</button>
                  <button onClick={(e) => deleteLayer(layer.id, e)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                    <Trash2 size={12} />
                  </button>
                  <button onClick={() => moveLayer(layer.id, 'down')} className="p-1 hover:bg-white/20 rounded text-[10px]">▼</button>
                  <button onClick={() => moveLayer(layer.id, 'right')} className="p-1 hover:bg-white/20 rounded text-[10px]">▶</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editing Toolbar & Inputs Panel */}
      <div className="w-full max-w-sm flex flex-col gap-3 mt-4 bg-[#2d3748]/80 p-3 rounded-xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">Text Layers</span>
          <Button 
            onClick={addTextLayer}
            className="h-7 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-400/30 text-[10px] font-semibold rounded-lg flex items-center gap-1"
          >
            <Plus size={12} /> Add Text Box
          </Button>
        </div>

        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
          {textLayers.map((layer, idx) => (
            <div key={layer.id} className={`flex items-center gap-2 p-2 rounded-lg border ${activeId === layer.id ? 'border-amber-400 bg-black/40' : 'border-white/10 bg-black/20'}`}>
              <span className="text-[10px] font-bold text-zinc-400">#{idx + 1}</span>
              <input
                type="text"
                value={layer.text}
                onChange={(e) => updateText(layer.id, e.target.value)}
                onClick={() => setActiveId(layer.id)}
                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                placeholder="Type your message..."
              />
              <button onClick={(e) => deleteLayer(layer.id, e)} className="text-zinc-500 hover:text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}