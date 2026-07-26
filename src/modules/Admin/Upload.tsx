"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { UploadDropzone } from '@/app/utils/uploadthing';
import { trpc } from '@/trpc/client';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminUploadClientProps {
  username: string;
  letterType?: string;
  title?: string;
}

export function AdminUploadClient({ username, letterType = 'birthday-wishes', title = 'Upload Frame' }: AdminUploadClientProps) {
  const [frameTitle, setFrameTitle] = useState('');
  const [type, setType] = useState(letterType);
  const [content, setContent] = useState('');
  const [fontFamily, setFontFamily] = useState('Arial, sans-serif');
  const [imageUrl, setImageUrl] = useState('');
  const [success, setSuccess] = useState(false);

  const createFrameMutation = trpc.frame.createFrame.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setFrameTitle('');
      setContent('');
      setImageUrl('');
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    createFrameMutation.mutate({ 
      title: frameTitle, 
      type, 
      imageUrl,
      content,
      fontStyle: fontFamily, // saves the chosen font family string
    });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#1a202c] p-6 text-white">
      <header className="flex w-full max-w-md items-center justify-between pt-2 pb-6 mb-4">
        <Link href={`/dashboard/${username}`} className="flex items-center gap-2 pl-5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> 
        </Link>
        <h1 className="text-lg font-black tracking-wider text-amber-400">{title}</h1>
      </header>

      <div className="w-full max-w-md flex flex-col gap-6 rounded-sm bg-[#2d3748]/80 border border-white/10 p-6 shadow-xl backdrop-blur-md">
        {success && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 p-4 text-emerald-300 text-sm font-medium">
            <CheckCircle2 size={18} /> Frame uploaded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Frame Title / Caption</label>
            <input 
              type="text" 
              value={frameTitle}
              onChange={(e) => setFrameTitle(e.target.value)}
              placeholder="e.g., Happy Birthday Special Wish" 
              required
              className="h-11 rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Category Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="birthday-wishes">Birthday wishes</option>
              <option value="new-month-wishes">New month wishes</option>
              <option value="new-year-wishes">New year wishes</option>
              <option value="letters">Letters</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">Letter Content & Font Family</label>
              <select 
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="h-8 rounded-lg bg-black/40 border border-white/10 px-2 text-xs text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans</option>
              </select>
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the message or letter content here..." 
              rows={4}
              style={{ fontFamily: fontFamily }}
              className="rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Upload Image Frame</label>
            {imageUrl ? (
              <div className="relative flex items-center justify-between rounded-xl bg-black/40 border border-white/10 p-3 text-sm text-emerald-400">
                <span className="truncate">Image uploaded successfully</span>
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')}
                  className="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="frameUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.url) {
                    setImageUrl(res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
                className="ut-allowed-content:text-zinc-400 ut-label:text-amber-400 border-dashed border-white/20 bg-black/20 rounded-2xl"
              />
            )}
          </div>

          <Button 
            type="submit" 
            disabled={!imageUrl || createFrameMutation.isPending}
            className="mt-2 h-12 w-full rounded-full bg-amber-500 text-base font-bold text-black hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            {createFrameMutation.isPending ? "Saving..." : "Publish Frame"}
          </Button>
        </form>
      </div>
    </main>
  );
}