import type { ReactNode } from "react";
import { Header } from "@/components/header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
