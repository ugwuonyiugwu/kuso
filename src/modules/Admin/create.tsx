"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Edit3, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface NewMonthWishClientProps {
  initialName?: string;
  initialMessage?: string;
  initialId?: number;
}

export function NewMonthWishClient({ 
  initialName, 
  initialMessage = "may the almighty go ahead of you, smoothing every rough path and turning your silent prayers into loud testimonies. happy new month!",
  initialId
}: NewMonthWishClientProps) {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get('name');
  const messageParam = searchParams.get('message');

  const [name, setName] = useState(nameParam || initialName || 'Onyedikachi');
  const [message, setMessage] = useState(messageParam || initialMessage);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // tRPC mutation pointing to frameRouter's createWish procedure
  const createWishMutation = trpc.frame.createWish.useMutation();

  // Slower opening doors/zip animation (600ms delay, 1500ms duration)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppShare = async () => {
    try {
      // Save data via tRPC mutation to get a short database ID
      const result = await createWishMutation.mutateAsync({
        name: name.trim() || 'Friend',
        message: message.trim(),
      });

      const wishId = result?.id;

      // Build a clean short link using the database record ID
      const baseUrl = window.location.origin;
      const shortLink = wishId ? `${baseUrl}/wish/${wishId}` : getFallbackLink();

      sessionStorage.setItem('ad_whatsapp_triggered', 'true');
      window.dispatchEvent(new Event('whatsapp_shared'));

      // Clean NGL Style: Send ONLY the URL so WhatsApp displays only the rich preview card
      const text = encodeURIComponent(shortLink);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    } catch (error) {
      console.error('Error sharing to WhatsApp via tRPC:', error);
      // Fallback sharing link
      const fallbackLink = getFallbackLink();
      const text = encodeURIComponent(fallbackLink);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  const getFallbackLink = () => {
    if (typeof window === 'undefined') return '';
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('name', name.trim() || 'Friend');
    if (message.trim() && message.trim() !== initialMessage) {
      params.set('message', message.trim());
    }
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center p-6 bg-[#FDFBF7] min-h-screen text-zinc-800 relative overflow-hidden">
      
      {/* Slower Door / Zip Opening Overlay Panels (1.5s duration) */}
      <div className={`absolute inset-y-0 left-0 w-1/2 bg-[#2d3748] z-30 transition-transform duration-1500 ease-in-out ${isOpen ? '-translate-x-full' : 'translate-x-0'} flex items-center justify-end border-r border-amber-400/30 shadow-2xl`}>
        <div className="absolute right-3 text-amber-300 animate-pulse font-serif italic text-xs tracking-widest uppercase opacity-70">
          ✨ Welcome To
        </div>
      </div>
      <div className={`absolute inset-y-0 right-0 w-1/2 bg-[#2d3748] z-30 transition-transform duration-1500 ease-in-out ${isOpen ? 'translate-x-full' : 'translate-x-0'} flex items-center justify-start border-l border-amber-400/30 shadow-2xl`}>
        <div className="absolute left-3 text-amber-300 animate-pulse font-serif italic text-xs tracking-widest uppercase opacity-70">
          July 🌸
        </div>
      </div>

      {/* Falling Flowers Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div className="absolute top-0 left-[15%] text-lg animate-[fall_4s_ease-in-out_infinite] opacity-90">🌸</div>
        <div className="absolute top-0 left-[35%] text-base animate-[fall_5s_ease-in-out_1s_infinite] opacity-90">🌷</div>
        <div className="absolute top-0 left-[55%] text-lg animate-[fall_4.5s_ease-in-out_0.5s_infinite] opacity-90">✨</div>
        <div className="absolute top-0 left-[75%] text-base animate-[fall_5.5s_ease-in-out_1.5s_infinite] opacity-90">🌸</div>
        <div className="absolute top-0 left-[85%] text-lg animate-[fall_3.8s_ease-in-out_0.8s_infinite] opacity-90">🌷</div>
      </div>

      {/* Card Frame Container with Slower Pop-Up Scale Animation */}
      <div className={`relative w-full aspect-3/4 p-4 mb-5 flex items-center justify-center transition-all duration-1200 ease-out delay-700 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-12'}`}>
        {/* Soft Drop Shadow Layer */}
        <div className="absolute inset-4 rounded-2xl bg-black/15 blur-xl shadow-2xl pointer-events-none" />

        {/* Background Frame Image */}
        <img 
          src="/frame.jpg" 
          alt="Greeting Card Frame" 
          className="relative w-full h-full object-contain drop-shadow-md z-0"
        />

        {/* Card Text Content Overlay */}
        <div className="absolute inset-0 m-7 pt-15 px-6 flex flex-col justify-start text-left z-10 overflow-hidden">
          <p className="text-base md:text-lg italic font-serif text-amber-200 pl-7 mb-2 drop-shadow animate-bounce shrink-0 truncate">
            Dear {name},
          </p>
          <p className="text-[11px] md:text-xs font-medium leading-relaxed text-zinc-100 italic drop-shadow overflow-y-auto whitespace-pre-wrap max-h-[70%]">
            {message}
          </p>
        </div>

        {/* Accumulated Flower Floor */}
        <div className="absolute bottom-6 inset-x-8 h-6 flex items-end justify-around z-20 pointer-events-none text-sm opacity-95">
          <span>🌸</span><span>🌷</span><span>🌸</span><span>🌺</span><span>🌷</span><span>🌸</span><span>🌺</span><span>🌷</span>
        </div>
      </div>

      {/* Floating Toggle Edit Button */}
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="mb-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 text-xs font-semibold border border-amber-500/30 shadow-sm transition-all active:scale-95 cursor-pointer z-10"
      >
        {isEditing ? <X size={14} /> : <Edit3 size={14} />}
        {isEditing ? "Close Editor" : "Customize Your Own Card"}
      </button>

      {/* Expandable Editing Panel */}
      {isEditing && (
        <div className="w-full flex flex-col gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-md mb-4 animate-in fade-in slide-in-from-top-4 duration-300 z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-zinc-500">Edit Recipient Name:</label>
            <Input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter name..."
              className="bg-zinc-50 border-zinc-200 text-zinc-900 h-9 rounded-xl text-sm focus-visible:ring-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-zinc-500">Edit Card Message:</label>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Enter custom wish message..."
              rows={4}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-xl text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 resize-none"
            />
          </div>

          {/* Action Buttons inside Editor */}
          <div className="flex items-center gap-2 pt-1">
            <Button 
              onClick={handleWhatsAppShare}
              disabled={createWishMutation.isPending}
              className="h-9 flex-1 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              {createWishMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} className="fill-white" />}
              {createWishMutation.isPending ? "Saving..." : "WhatsApp"}
            </Button>

            <Link
              href={"/"} 
              className="h-9 flex-1 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              Explore
            </Link>
          </div>
        </div>
      )}

      {/* CSS Keyframe for falling flowers */}
      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(90vh) rotate(360deg);
            opacity: 0.9;
          }
        }
      `}</style>

    </div>
  );
}