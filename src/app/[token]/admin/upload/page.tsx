import { HydrateClient, trpc } from "@/trpc/server";
import { AdminUploadClient } from "@/modules/Admin/Upload";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function AdminUploadPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  
  // Grab token from route segment or fallback to query parameter
  const token = resolvedParams.token || resolvedSearch.token;

  if (!token) {
    notFound();
  }

  try {
    await trpc.user.getUserByToken.prefetch({ token });
  } catch (error) {
    notFound();
  }

  return (
    <HydrateClient>
      <AdminUploadClient token={token} />
    </HydrateClient>
  );
}