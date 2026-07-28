"use client";

import React, { useState, useRef } from 'react';
import { trpc } from '@/trpc/client';
import { Plus, Trash2, ArrowLeft, Share2, Palette, Eye, EyeOff, Sliders } from 'lucide-react';
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
  width: number;
  fontSize: number; // Added font size percentage scale
  color: string;
  fontStyle: string;
}

const FONT_OPTIONS = [
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive' }, // Fixed fallback stack for authentic curly/casual look
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
];

const COLOR_OPTIONS = [
  '#ffffff', // White
  '#000000', // Black
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
];

export function EditFrameClient({ username, letterType, frameId }: EditFrameClientProps) {
  const [frame] = trpc.frame.getById.useSuspenseQuery({ id: Number(frameId) });

  const [textLayers, setTextLayers] = useState<TextLayer[]>([
    { id: '1', text: 'Type your message here...', x: 50, y: 35, width: 80, fontSize: 42, color: '#ffffff', fontStyle: 'Roboto, sans-serif' },
  ]);

  const [activeId, setActiveId] = useState<string | null>('1');
  const [isSharing, setIsSharing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeLayer = textLayers.find(l => l.id === activeId);

  const addTextLayer = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: 'New text box',
      x: 50,
      y: 55,
      width: 80,
      fontSize: 42,
      color: '#ffffff',
      fontStyle: 'Roboto, sans-serif',
    };
    setTextLayers([...textLayers, newLayer]);
    setActiveId(newLayer.id);
  };

  const updateText = (id: string, text: string) => {
    setTextLayers(textLayers.map(l => l.id === id ? { ...l, text } : l));
  };

  const updateLayerProp = <K extends keyof TextLayer>(id: string, prop: K, value: TextLayer[K]) => {
    setTextLayers(textLayers.map(l => l.id === id ? { ...l, [prop]: value } : l));
  };

  const updateWidth = (id: string, delta: number) => {
    setTextLayers(textLayers.map(l => {
      if (l.id !== id) return l;
      const newWidth = Math.max(30, Math.min(100, l.width + delta));
      return { ...l, width: newWidth };
    }));
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
      if (direction === 'right') x = Math.min(85, x + step);
      return { ...l, x, y };
    }));
  };

  const handleShareAsImage = async () => {
    if (!frame?.imageUrl) return;
    try {
      setIsSharing(true);
      setActiveId(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");

      canvas.width = 1200;
      canvas.height = 1600;

      const bgImage = new Image();
      bgImage.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = reject;
        bgImage.src = frame.imageUrl;
      });

      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      textLayers.forEach((layer) => {
        const posX = (layer.x / 100) * canvas.width;
        const posY = (layer.y / 100) * canvas.height;

        ctx.fillStyle = layer.color;
        ctx.font = `bold ${layer.fontSize}px ${layer.fontStyle}`;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        const maxWidth = (layer.width / 100) * canvas.width;
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

        const lineHeight = layer.fontSize * 1.3;
        const startY = posY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((l, index) => {
          ctx.fillText(l.trim(), posX, startY + (index * lineHeight));
        });
      });

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
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet" />

      <header className="flex w-full items-center justify-between pt-2 pb-3 px-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link href={`/${username}/letter/${letterType}`} className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1">
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="text-zinc-600">/</span>
          <h1 className="text-xs font-bold text-amber-400">Edit Card</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              if (!isPreviewMode) setActiveId(null);
            }}
            className={`h-7 px-2.5 text-[10px] font-semibold rounded-lg flex items-center gap-1 border ${
              isPreviewMode 
                ? 'bg-amber-500 text-stone-950 border-amber-400' 
                : 'bg-zinc-800 text-zinc-300 border-white/10 hover:bg-zinc-700'
            }`}
          >
            {isPreviewMode ? <EyeOff size={12} /> : <Eye size={12} />}
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </Button>

          <Button 
            onClick={handleShareAsImage}
            disabled={isSharing}
            className="h-7 px-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[10px] rounded-lg flex items-center gap-1"
          >
            <Share2 size={12} /> {isSharing ? "Generating..." : "Share as Image"}
          </Button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div 
        ref={cardRef}
        className="relative w-full max-w-70 aspect-3/4 bg-black overflow-hidden border border-white/20 shadow-2xl my-2"
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
          const isActive = activeId === layer.id && !isPreviewMode;
          // Scale down the canvas fontSize value proportionally for real-time DOM display view
          const displayFontSize = Math.max(12, layer.fontSize * 0.35);

          return (
            <div
              key={layer.id}
              onClick={() => !isPreviewMode && setActiveId(layer.id)}
              style={{ 
                left: `${layer.x}%`, 
                top: `${layer.y}%`, 
                width: `${layer.width}%`,
                transform: 'translate(-50%, -50%)' 
              }}
              className={`absolute transition-all p-2 rounded-lg text-center ${
                isPreviewMode 
                  ? 'cursor-default border-none bg-transparent' 
                  : isActive 
                    ? 'cursor-pointer border-2 border-amber-400 bg-black/70 shadow-xl scale-105 z-25' 
                    : 'cursor-pointer border border-dashed border-white/30 bg-black/40 z-10'
              }`}
            >
              <p 
                style={{ 
                  color: layer.color, 
                  fontFamily: layer.fontStyle,
                  fontSize: `${displayFontSize}px`
                }}
                className="font-bold text-center tracking-wide drop-shadow-md wrap-break-word whitespace-normal w-full"
              >
                {layer.text || <span className="opacity-40 italic">Empty text</span>}
              </p>

              {isActive && !isPreviewMode && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/95 border border-white/20 p-1 rounded-md shadow-xl z-30 whitespace-nowrap">
                  <button onClick={() => updateWidth(layer.id, -10)} className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[9px]" title="Shrink Width">⟨ ⟩</button>
                  <button onClick={() => moveLayer(layer.id, 'left')} className="p-1 hover:bg-white/20 rounded text-[10px]">◀</button>
                  <button onClick={() => moveLayer(layer.id, 'up')} className="p-1 hover:bg-white/20 rounded text-[10px]">▲</button>
                  <button onClick={(e) => deleteLayer(layer.id, e)} className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                    <Trash2 size={12} />
                  </button>
                  <button onClick={() => moveLayer(layer.id, 'down')} className="p-1 hover:bg-white/20 rounded text-[10px]">▼</button>
                  <button onClick={() => moveLayer(layer.id, 'right')} className="p-1 hover:bg-white/20 rounded text-[10px]">▶</button>
                  <button onClick={() => updateWidth(layer.id, 10)} className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[9px]" title="Expand Width">⟩ ⟨</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editing Toolbar & Inputs Panel */}
      {!isPreviewMode && (
        <div className="w-full max-w-sm flex flex-col gap-3 mt-4 bg-[#2d3748]/80 p-3 rounded-xl border border-white/10 backdrop-blur-md">
          {activeLayer && (
            <div className="flex flex-col gap-2.5 p-2.5 bg-black/40 rounded-lg border border-amber-400/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <Palette size={11} /> Style Active Box
                </span>
              </div>

              {/* Font Style Selection */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => updateLayerProp(activeLayer.id, 'fontStyle', f.value)}
                    style={{ fontFamily: f.value }}
                    className={`px-2 py-1 text-[10px] rounded border whitespace-nowrap transition-colors ${
                      activeLayer.fontStyle === f.value 
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400' 
                        : 'bg-zinc-900 text-zinc-300 border-white/10 hover:bg-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Font Size Slider Control */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-semibold text-zinc-300 flex items-center gap-1">
                  <Sliders size={10} /> Size:
                </span>
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="4"
                  value={activeLayer.fontSize}
                  onChange={(e) => updateLayerProp(activeLayer.id, 'fontSize', Number(e.target.value))}
                  className="flex-1 accent-amber-500 cursor-pointer h-1 bg-zinc-700 rounded-lg"
                />
                <span className="text-[10px] font-bold text-amber-400 w-6 text-right">
                  {activeLayer.fontSize}px
                </span>
              </div>

              {/* Color Palette Toggles */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {COLOR_OPTIONS.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => updateLayerProp(activeLayer.id, 'color', hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      activeLayer.color === hex ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

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
      )}
    </main>
  );
}