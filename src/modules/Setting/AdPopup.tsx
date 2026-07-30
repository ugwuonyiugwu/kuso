"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { trpc } from '@/trpc/client';

export function AdPopup() {
  const [showAd, setShowAd] = useState(false);
  const pathname = usePathname();
  
  // Fetch advertisement settings from the backend via tRPC
  const { data: settings } = trpc.settings.getAdSettings.useQuery();

  useEffect(() => {
    // 1. Verify if the current route is part of the dashboard experience
    const isDashboard = pathname?.includes('/dashboard');

    if (!isDashboard) {
      setShowAd(false);
      return;
    }

    // 2. Check if ads are enabled and an image exists
    if (settings?.isActive && settings?.adImage) {
      const hasShownThisSession = sessionStorage.getItem('ad_dashboard_shown');

      // 3. If it hasn't been shown yet this session, trigger the popup
      if (!hasShownThisSession) {
        const timer = setTimeout(() => {
          setShowAd(true);
          sessionStorage.setItem('ad_dashboard_shown', 'true');
        }, 500); // Small delay to let the dashboard render smoothly
        
        return () => clearTimeout(timer);
      }
    }
  }, [settings, pathname]);

  const handleClose = () => {
    setShowAd(false);
  };

  if (!showAd || !settings?.adImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-xs bg-[#1e2533] border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-zinc-800 text-white border border-white/20 flex items-center justify-center hover:bg-zinc-700 transition-colors shadow-md cursor-pointer z-10"
        >
          <X size={16} />
        </button>

        <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase mb-2">
          Sponsored Advertisement
        </span>

        {/* Ad Image / Banner */}
        {settings.adLink ? (
          <a 
            href={settings.adLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={handleClose}
            className="w-full overflow-hidden rounded-2xl block hover:opacity-95 transition-opacity"
          >
            <img src={settings.adImage} alt="Advertisement" className="w-full h-auto object-cover rounded-2xl max-h-[350px]" />
          </a>
        ) : (
          <div className="w-full overflow-hidden rounded-2xl">
            <img src={settings.adImage} alt="Advertisement" className="w-full h-auto object-cover rounded-2xl max-h-[350px]" />
          </div>
        )}

        <button 
          onClick={handleClose}
          className="mt-4 w-full h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}