import type { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
