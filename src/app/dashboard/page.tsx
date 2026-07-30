import { HydrateClient, trpc } from "@/trpc/server";
import { DashboardClient } from "@/modules/Dashboard/Dashboard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
  params?: Promise<{
    token?: string;
  }>;
}

export default async function DashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const params = props.params ? await props.params : {};
  
  const token = searchParams.token || params.token;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white p-6">
        <div className="text-center rounded-3xl bg-black/40 p-8 border border-red-500/20 max-w-sm w-full">
          <h1 className="text-xl font-bold text-red-400 mb-2">Missing Token</h1>
          <p className="text-xs text-zinc-400">No access token provided in the URL.</p>
        </div>
      </main>
    );
  }

  // Safely await the prefetch without letting a failure crash the server render
  try {
    await trpc.user.getUserByToken.prefetch({ token });
  } catch (error) {
    console.error("Prefetch error:", error);
  }

  return (
    <HydrateClient>
      <Suspense 
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[#1a202c] text-white">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </main>
        }
      >
        <DashboardClient token={token} />
      </Suspense>
    </HydrateClient>
  );
}