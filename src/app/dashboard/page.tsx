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

  if (!token) {
    return {
      metadataBase: new URL(siteUrl),
      title: "Anonymous messages!",
      description: "Send me anonymous messages!",
      openGraph: {
        title: "Anonymous messages!",
        description: "Send me anonymous messages!",
        images: [{ url: `${siteUrl}/opengraph-image.png`, width: 800, height: 800, alt: "Anonymous Messages" }],
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Anonymous messages!",
        description: "Send me anonymous messages!",
        images: [`${siteUrl}/opengraph-image.png`],
      },
    };
  }

  const user = await db.query.users.findFirst({
    where: eq(users.secretToken, token),
  });

  const descriptionText = user?.username ? `Send anonymous messages to @${user.username}!` : "Send me anonymous messages!";

  return {
    metadataBase: new URL(siteUrl),
    title: "Anonymous messages!",
    description: descriptionText,
    openGraph: {
      title: "Anonymous messages!",
      description: descriptionText,
      images: [
        {
          url: `${siteUrl}/opengraph-image.png`, // Absolute URL for WhatsApp scraper
          width: 800,
          height: 800,
          alt: "Anonymous Messages",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary", // Forces the square image layout on the left side
      title: "Anonymous messages!",
      description: descriptionText,
      images: [`${siteUrl}/opengraph-image.png`],
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