"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { trpc } from '@/trpc/client';
import { CheckCircle2, ArrowLeft, AlertCircle, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useUploadThing } from '@/app/utils/uploadthing';

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
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // Use UploadThing hook for manual file uploads
  const { startUpload, isUploading } = useUploadThing("frameUploader", {
    onUploadError: (error) => {
      setErrorMsg(`Upload error: ${error.message}`);
    },
  });

  const createFrameMutation = trpc.frame.createFrame.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setFrameTitle('');
      setContent('');
      setFile(null);
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

    if (!file) {
      setErrorMsg('Please select an image file before publishing.');
      return;
    }

    try {
      // 1. Upload file to UploadThing first
      const uploadRes = await startUpload([file]);

      const uploadedUrl = uploadRes?.[0]?.url || (uploadRes?.[0] as { ufsUrl?: string })?.ufsUrl;

      if (!uploadedUrl) {
        setErrorMsg('Failed to get upload URL from UploadThing.');
        return;
      }

      // 2. Save everything (Image URL, Text content, Font, etc.) to Neon database via tRPC
      createFrameMutation.mutate({
        title: frameTitle,
        type,
        imageUrl: uploadedUrl,
        content,
        fontStyle: fontFamily,
      });

    } catch (err: any) {
      setErrorMsg(`Error: ${err?.message || 'Something went wrong'}`);
    }
  };

  const isPending = isUploading || createFrameMutation.isPending;

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
            <CheckCircle2 size={18} /> Frame uploaded and published successfully!
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/20 border border-red-500/30 p-4 text-red-300 text-sm font-medium">
            <AlertCircle size={18} /> {errorMsg}
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
            <label className="text-xs font-semibold text-zinc-300">Select Image Frame</label>
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
                id="file-upload"
              />
              <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer w-full">
                <UploadCloud size={28} className="text-amber-400" />
                <span className="text-xs text-zinc-300 font-medium">
                  {file ? file.name : "Click to browse image file"}
                </span>
                <span className="text-[10px] text-zinc-500">Supports PNG, JPG, GIF</span>
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="mt-2 h-12 w-full rounded-full bg-amber-500 text-base font-bold text-black hover:bg-amber-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Publishing Everything..." : "Publish Frame"}
          </Button>
        </form>
      </div>
    </main>
  );
}