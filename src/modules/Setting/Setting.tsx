"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from '@/trpc/client';
import { CheckCircle2, ArrowLeft, AlertCircle, UploadCloud, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/app/utils/uploadthing';

export function SettingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [adLink, setAdLink] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch initial settings from server cache/prefetch
  const { data: serverSettings, isLoading: isFetching } = trpc.settings.getAdSettings.useQuery();

  // Initialize form state once serverSettings are loaded
  const [initialized, setInitialized] = useState(false);
  const [adImage, setAdImage] = useState('');

  React.useEffect(() => {
    if (serverSettings && !initialized) {
      setAdImage(serverSettings.adImage || '');
      setAdLink(serverSettings.adLink || '');
      setIsActive(serverSettings.isActive ?? true);
      setInitialized(true);
    }
  }, [serverSettings, initialized]);

  // Use UploadThing hook for manual file uploads
  const { startUpload, isUploading } = useUploadThing("adImageUploader", {
    onUploadError: (error) => {
      setErrorMsg(`Upload error: ${error.message}`);
    },
  });

  const updateSettingsMutation = trpc.settings.updateAdSettings.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setErrorMsg('');
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      setErrorMsg(`Database error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      let finalImageUrl = adImage;

      // If a new local file was selected, upload it via UploadThing first
      if (file) {
        const uploadRes = await startUpload([file]);
        const uploadedUrl = uploadRes?.[0]?.url || (uploadRes?.[0] as { ufsUrl?: string })?.ufsUrl;

        if (!uploadedUrl) {
          setErrorMsg('Failed to get upload URL from UploadThing.');
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      // Save settings changes via tRPC mutation (no token required)
      await updateSettingsMutation.mutateAsync({
        adImage: finalImageUrl,
        adLink,
        isActive,
      });

      setFile(null);
    } catch (err: any) {
      setErrorMsg(`Error: ${err?.message || 'Something went wrong'}`);
    }
  };

  const isPending = isUploading || updateSettingsMutation.isPending;

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-6 text-white">
      <header className="flex w-full max-w-md items-center justify-between pt-2 pb-6 mb-4">
        <Link href="/" className="flex items-center gap-2 pl-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-black tracking-wider text-amber-400">Advertisement Settings</h1>
        <div className="w-6" />
      </header>

      <div className="w-full max-w-md flex flex-col gap-6 rounded-3xl bg-[#2d3748]/80 border border-white/10 p-6 shadow-xl backdrop-blur-md">
        {success && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 p-4 text-emerald-300 text-sm font-medium">
            <CheckCircle2 size={18} /> Settings saved successfully!
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/20 border border-red-500/30 p-4 text-red-300 text-sm font-medium">
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Upload Ad Banner</label>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 p-4 text-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="hidden" 
                id="ad-file-upload"
              />
              <label htmlFor="ad-file-upload" className="flex flex-col items-center gap-2 cursor-pointer w-full">
                {file ? (
                  <span className="text-xs text-amber-300 font-medium">Selected: {file.name}</span>
                ) : adImage ? (
                  <div className="relative w-full h-28 mb-1 rounded-xl overflow-hidden border border-white/10">
                    <img src={adImage} alt="Current Ad Banner" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <ImageIcon size={28} className="text-amber-400" />
                )}
                <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
                  <UploadCloud size={16} className="text-amber-400" />
                  {file ? "Click to change file" : "Click to browse new image"}
                </span>
                <span className="text-[10px] text-zinc-500">Supports PNG, JPG, GIF (Max 4MB)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Or Paste Image URL</label>
            <Input 
              type="text"
              value={adImage}
              onChange={(e) => setAdImage(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className="h-11 rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Target Link (Optional)</label>
            <Input 
              type="text"
              value={adLink}
              onChange={(e) => setAdLink(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-11 rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox"
              id="activeToggle"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
            <label htmlFor="activeToggle" className="text-sm font-medium text-zinc-200 cursor-pointer">
              Enable Ad Pop-up on Pages
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-full bg-amber-500 text-base font-bold text-black hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isPending ? "Saving Settings..." : "Save Settings"}
          </Button>
        </form>
      </div>
    </main>
  );
}