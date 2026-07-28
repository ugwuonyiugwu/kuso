"use client";

import React, { useState, useRef } from 'react';
import { trpc } from '@/trpc/client';
import { Plus, Trash2, ArrowLeft, Share2 } from 'lucide-react';
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
  const [frame] = trpc.frame.getById.useSuspenseQuery({ id: Number(frameId) });

  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    { id: '1', text: 'Type your message here...', x: 50, y: 35 },
  ]);

  const [activeId, setActiveId] = useState<string | null>('1');
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: 'New text box',
      x: 50,
      y: 55,
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
    const step = 4;
    setTextLayers(textLayers.map(l => {
      if (l.id !== id) return l;
      let { x, y } = l;
      if (direction === 'up') y = Math.max(10, y - step);
      if (direction === 'down') y = Math.min(90, y + step);
      if (direction === 'left') x = Math.max(15, x - step);
      if (direction === 'right') x = Math.max(85, x + step);
      return { ...l, x, y };
    }));
  };

  // Robust Native HTML5 Canvas Image Generator (Bypasses CORS & DOM styling bugs)
  const handleShareAsImage = async () => {
    if (!frame?.imageUrl) return;
    try {
      setIsSharing(true);
      setActiveId(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");

      // Set high-res canvas proportions (matching 3:4 aspect ratio)
      canvas.width = 1200;
      canvas.height = 1600;

      // Load background image safely via a cross-origin image object
      const bgImage = new Image();
      bgImage.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = reject;
        bgImage.src = frame.imageUrl;
      });

      // Draw background image to fill canvas
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      // Configure text style for layers
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 42px sans-serif';

      // Draw each text layer onto the canvas at its relative position
      textLayers.forEach((layer) => {
        const posX = (layer.x / 100) * canvas.width;
        const posY = (layer.y / 100) * canvas.height;

        // Add shadow for text legibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Simple text-wrapping logic for canvas text
        const maxWidth = canvas.width * 0.75;
        const words = layer.text.split(' ');
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

        // Render each wrapped line sequentially
        const lineHeight = 54;
        const startY = posY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((l, index) => {
          ctx.fillText(l.trim(), posX, startY + (index * lineHeight));
        });
      });

      // Convert canvas to image blob
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${letterType}-card.png`, { type: "image/png" });

      const shareUrl = `${window.location.origin}/${username}/letter/${letterType}/view/${frameId}`;
      const shareMessage = `Check out this custom ${letterType} card! View the full frame here: ${shareUrl}`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Custom Letter Card',
          text: shareMessage,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `${letterType}-card.png`;
        link.href = dataUrl;
        link.click();
        
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (error) {
      console.error("Error generating native image:", error);
      alert("Could not generate image share. Please check console for details.");
    } finally {
      setIsSharing(false);
    }
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
          onClick={handleShareAsImage}
          disabled={isSharing}
          className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] rounded-lg flex items-center gap-1"
        >
          <Share2 size={12} /> {isSharing ? "Generating..." : "Share as Image"}
        </Button>
      </header>

      {/* Main Canvas Area */}
      <div 
        ref={cardRef}
        className="relative w-full max-w-70 aspect-3/4 bg-black rounded-xl overflow-hidden border border-white/20 shadow-2xl my-2"
      >
        {frame?.imageUrl && (
          <img 
            src={frame.imageUrl} 
            alt={frame.title} 
            crossOrigin="anonymous" 
            className="w-full h-full object-cover select-none pointer-events-none" 
          />
        )}

        {textLayers.map((layer) => {
          const isActive = activeId === layer.id;
          return (
            <div
              key={layer.id}
              onClick={() => setActiveId(layer.id)}
              style={{ left: `${layer.x}%`, top: `${layer.y}%`, transform: 'translate(-50%, -50%)' }}
              className={`absolute cursor-pointer transition-all p-2 rounded-lg max-w-[80%] w-max ${
                isActive ? 'border-2 border-amber-400 bg-black/70 shadow-xl scale-105 z-20' : 'border border-dashed border-white/30 bg-black/40 z-10'
              }`}
            >
              {/* Responsive wrapped text container */}
              <p className="text-white font-medium text-center text-xs md:text-sm tracking-wide drop-shadow-md break-words whitespace-normal">
                {layer.text || <span className="opacity-40 italic">Empty text</span>}
              </p>

              {/* Floating controls */}
              {isActive && (
                <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/95 border border-white/20 p-1 rounded-md shadow-xl z-30">
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