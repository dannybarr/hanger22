"use client";

import { useState } from "react";
import { RequestSheet } from "@/components/request/RequestSheet";

export function RequestButton({ itemId, title }: { itemId: string; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="pill-btn hidden md:inline-flex" onClick={() => setOpen(true)}>
        Request this piece
      </button>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 p-3 md:hidden">
        <button type="button" className="pill-btn w-full" onClick={() => setOpen(true)}>
          Request this piece
        </button>
      </div>
      {open ? <RequestSheet itemId={itemId} title={title} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
