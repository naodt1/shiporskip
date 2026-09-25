"use client";

import { useEffect } from "react";
import { useApp } from "./AppContext";

export function LoginPrompt({ reason }: { reason: string }) {
  const { gate } = useApp();
  // Open the modal straight away; after login the server re-renders this page.
  useEffect(() => gate(() => {}, reason), [gate, reason]);
  return (
    <div className="max-w-[680px]">
      <h1 className="m-0 mb-3 text-xl font-bold">My projects</h1>
      <p className="m-0 mb-3 text-muted-2">{reason}</p>
      <button onClick={() => gate(() => {}, reason)} className="rounded-md bg-green px-4 py-2 text-[15px] font-semibold text-white hover:bg-green-hover">
        Log in
      </button>
    </div>
  );
}
