import { HydrateClient, trpc } from "@/trpc/server";
import { DashboardClient } from "@/modules/Dashboard/Dashboard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function DashboardPage(props: PageProps) {
  const { username } = await props.params;

  if (!username) {
    return <div>Invalid Username</div>;
  }

  try {
    await trpc.user.getUserByUsername.prefetch({ username });
  } catch (error) {
    console.error("Prefetch error:", error);
    notFound();
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
        <DashboardClient username={username} />
      </Suspense>
    </HydrateClient>
  );
}