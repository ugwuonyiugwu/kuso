import { SettingsPage } from "@/modules/Setting/Setting";
import { trpc, HydrateClient } from "@/trpc/server";

export default async function SettingsServerPage() {
  // Prefetch advertisement settings on the server
  void trpc.settings.getAdSettings.prefetch();

  return (
    <HydrateClient>
      <SettingsPage />
    </HydrateClient>
  );
}