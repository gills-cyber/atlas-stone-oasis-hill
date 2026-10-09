import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Studio } from "@/components/manga/studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <TooltipProvider delayDuration={400} disableHoverableContent skipDelayDuration={0}>
      <Studio />
      <Toaster
        position="top-center"
        offset={56}
        duration={2600}
        toastOptions={{
          className: "font-sans pointer-events-auto",
        }}
      />
    </TooltipProvider>
  );
}
