"use client";

import { useParams } from "next/navigation";
import { EndUserProvider } from "@/contexts/EndUserContext";

export default function PublicBoardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const boardSlug = params.boardSlug as string;

  return (
    <EndUserProvider orgSlug={orgSlug} boardSlug={boardSlug}>
      {children}
    </EndUserProvider>
  );
}
