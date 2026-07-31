import { HydrateClient, trpc } from "@/trpc/server";
import { DashboardClient } from "@/modules/Dashboard/Dashboard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
  params?: Promise<{
    token?: string;
  }>;
}

const siteUrl = "https://kuso-silk.vercel.app";

// Generate dynamic metadata for the dashboard page preview
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = props.params ? await props.params : {};
  const token = searchParams.token || params.token;
  const imageUrl = `${siteUrl}/opengraph-image.png`;

  let dynamicTitle = "Anonymous messages!";
  let dynamicDescription = "Send me an anonymous message!";

  if (token) {
    try {
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.secretToken, token))
        .limit(1);

      if (targetUser?.customPrompt) {
        dynamicTitle = targetUser.customPrompt;
      }
    } catch (error) {
      console.error("Error fetching dashboard metadata prompt:", error);
    }
  }

  return {
    metadataBase: new URL(siteUrl),
    title: dynamicTitle,
    description: dynamicDescription,
    openGraph: {
      title: dynamicTitle,
      description: dynamicDescription,
      url: token ? `${siteUrl}/dashboard?token=${token}` : siteUrl,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: "Anonymous Messages",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: dynamicTitle,
      description: dynamicDescription,
      images: [imageUrl],
    },
  };
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