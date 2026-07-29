import { NewMonthWishClient } from "@/modules/Admin/create";

interface PageProps {
  searchParams: Promise<{
    name?: string;
  }>;
}

export default async function CreatePage({ searchParams }: PageProps) {
  const { name } = await searchParams;

  return (
    <main className="min-h-screen bg-[#1a202c] flex flex-col items-center justify-center">
      <NewMonthWishClient initialName={name} />
    </main>
  );
}