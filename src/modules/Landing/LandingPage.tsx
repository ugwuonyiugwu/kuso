"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

type Step = 'LANDING' | 'SIGN_IN' | 'COLOR' | 'USERNAME';

export const HomePage = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('LANDING');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [signInUsername, setSignInUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const utils = trpc.useUtils();

  const createUser = trpc.user.createUser.useMutation({
    onSuccess: () => {
      localStorage.setItem("kuso_username", username.trim());
      router.push(`/dashboard/${username.trim()}`);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    }
  });

  const handleSignIn = async () => {
    if (!signInUsername.trim()) return;
    setErrorMessage("");
    setIsSigningIn(true);

    try {
      const user = await utils.user.getUserByUsername.fetch({
        username: signInUsername.trim(),
      });

      if (user && user.username) {
        localStorage.setItem("kuso_username", user.username);
        router.push(`/dashboard/${user.username}`);
      } else {
        setErrorMessage("Username not found. Check it or register a new account.");
        setIsSigningIn(false);
      }
    } catch (error: any) {
      setErrorMessage("Something went wrong. Please try again.");
      setIsSigningIn(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!username.trim() || !selectedColor) return;
    setErrorMessage("");
    
    createUser.mutate({
      username: username.trim(),
      color: selectedColor,
    });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-6">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="h-full w-full object-cover"
        >
          <source src="/bg-animation.mp4" type="video/mp4" />
        </video>
        <div className={cn(
          "absolute inset-0 transition-colors duration-500",
          step !== 'LANDING' ? "bg-[#1a202c]/95" : "bg-none"
        )} />
      </div>

      {step !== 'LANDING' && (
        <button 
          onClick={() => {
            setErrorMessage("");
            if (step === 'SIGN_IN' || step === 'COLOR') setStep('LANDING');
            if (step === 'USERNAME') setStep('COLOR');
          }} 
          className="absolute left-6 top-6 z-20 text-white"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {step === 'LANDING' && (
        <div className="flex flex-1 flex-col items-center justify-between w-full">
          <div className="flex flex-1 items-center justify-center">
            <h1 className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_6px_0_rgba(0,0,0,1)]">
              KUSO
            </h1>
          </div>
          <div className="w-full max-w-sm pb-8 flex flex-col gap-4">
            <Button 
              onClick={() => setStep('COLOR')}
              className="h-16 w-full rounded-full bg-white text-lg font-bold text-black shadow-lg transition-transform active:scale-95 hover:bg-gray-100"
            >
              Get Started!
            </Button>
            <Button 
              onClick={() => setStep('SIGN_IN')}
              variant="outline"
              className="h-16 w-full rounded-full border-white/30 bg-transparent text-lg font-bold text-white hover:bg-white/10"
            >
              I already have an account
            </Button>
          </div>
        </div>
      )}

      {step === 'SIGN_IN' && (
        <div className="flex w-full max-w-sm flex-1 flex-col justify-center animate-in slide-in-from-right duration-300">
          <h2 className="mb-12 text-center text-4xl font-extrabold text-white leading-tight z-10">
            Welcome back
          </h2>

          <div className="relative flex items-center w-full">
            <Input 
              placeholder="@username"
              value={signInUsername}
              onChange={(e) => setSignInUsername(e.target.value)}
              className="h-20 w-full rounded-full border-2 border-white/20 bg-[#2d3748] px-8 text-center text-2xl font-bold text-white placeholder:text-white/50 focus:border-white focus:bg-white/10"
            />
          </div>

          {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-400 font-medium">{errorMessage}</p>
          )}

          <div className="mt-16">
            <Button 
              disabled={!signInUsername.trim() || isSigningIn}
              onClick={handleSignIn}
              className="h-16 w-full rounded-full bg-white text-lg font-bold text-black hover:bg-gray-200"
            >
              {isSigningIn ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </div>
      )}

      {step === 'COLOR' && (
        <div className="flex w-full max-w-sm flex-1 flex-col justify-center animate-in slide-in-from-right duration-300">
          <h2 className="mb-12 text-center text-4xl font-extrabold text-white leading-tight z-10">
            What is your<br/>favorite <br/>color?
          </h2>

          <div className="flex flex-col gap-6">
            {[
              { id: 'pink', label: 'Pink' },
              { id: 'blue', label: 'Blue' },
              { id: 'purple', label: 'Purple' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedColor(item.id)}
                className={cn(
                  "flex h-22 items-center justify-center gap-6 rounded-full border-4 text-4xl font-bold transition-all text-white",
                  selectedColor === item.id 
                    ? "border-white bg-white/10" 
                    : "border-zinc-50 bg-white/5"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-16">
            <Button 
              disabled={!selectedColor}
              onClick={() => setStep('USERNAME')}
              className="h-16 w-full rounded-full bg-white text-lg font-bold text-black hover:bg-gray-200"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'USERNAME' && (
        <div className="flex w-full max-w-sm flex-1 flex-col justify-center animate-in slide-in-from-right duration-300">
          <h2 className="mb-12 text-center text-4xl font-extrabold text-white leading-tight z-10">
            Choose a username
          </h2>

          <div className="relative flex items-center w-full">
            <Input 
              placeholder="@"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-20 w-full rounded-full border-2 border-white/20 bg-[#2d3748] px-8 text-center text-2xl font-bold text-white placeholder:text-white/50 focus:border-white focus:bg-white/10"
            />
          </div>

          {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-400 font-medium">{errorMessage}</p>
          )}

          <div className="mt-16">
            <Button 
              disabled={!username.trim() || createUser.isPending}
              onClick={handleFinalSubmit}
              className="h-16 w-full rounded-full bg-white text-lg font-bold text-black hover:bg-gray-200"
            >
              {createUser.isPending ? "Saving..." : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};