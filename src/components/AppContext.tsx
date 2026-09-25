"use client";

import { createContext, useContext } from "react";
import type { PublicUser } from "@/lib/auth";

export type AuthMode = "login" | "signup";

export type AppCtx = {
  user: PublicUser | null;
  /** Runs `fn` now if logged in; otherwise opens the auth modal and runs it after login. */
  gate: (fn: () => void, reason: string) => void;
  openAuth: (mode: AuthMode) => void;
  openPost: () => void;
  toast: (text: string) => void;
};

export const AppContext = createContext<AppCtx | null>(null);

export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("useApp outside AppShell");
  return c;
}
