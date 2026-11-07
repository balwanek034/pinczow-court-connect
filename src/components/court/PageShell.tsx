import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LeftMenu } from "@/components/court/LeftMenu";

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav aria-label="Ścieżka" className="mb-5 text-xs text-muted-foreground">
      <Link to="/" className="gov-link">
        Strona główna
      </Link>
      {items.map((i) => (
        <span key={i}>
          <span className="mx-2">›</span>
          <span className="text-foreground">{i}</span>
        </span>
      ))}
    </nav>
  );
}

export function PageShell({
  crumbs,
  title,
  children,
}: {
  crumbs: string[];
  title: string;
  children: ReactNode;
}) {
  return (
    <main id="tresc" className="mx-auto max-w-6xl px-4 py-6">
      <Breadcrumbs items={crumbs} />
      <div className="grid gap-6 lg:grid-cols-[236px_1fr]">
        <LeftMenu />
        <div className="bg-tile p-6">
          <h1 className="section-title !text-2xl !normal-case">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
