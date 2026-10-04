"use client";

import { useEffect } from "react";
import { useApp } from "./AppContext";
import { PageHeader } from "./PageHeader";

export function LoginPrompt({ reason }: { reason: string }) {
  const { gate } = useApp();
  // Open the modal straight away; after login the server re-renders this page.
  useEffect(() => gate(() => {}, reason), [gate, reason]);
  return (
    <div className="max-w-[680px]">
      <PageHeader title="Log in to see your campaigns">{reason}</PageHeader>
      <button onClick={() => gate(() => {}, reason)} className="btn btn-primary">
        Log in
      </button>
    </div>
  );
}
