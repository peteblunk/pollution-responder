"use client";

import { GameStateProvider } from "@/hooks/use-game-state";

export function Providers({ children }: { children: React.ReactNode }) {
  return <GameStateProvider>{children}</GameStateProvider>;
}
