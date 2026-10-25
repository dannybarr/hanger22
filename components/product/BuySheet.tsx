"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Field, focusFirstError, Honeypot, PrivacyNote, useModal } from "@/components/forms/Field";

type Fields = { name: string; email: string; phone: string; size: string; notes: string };

export type BuyPiece = {
  id: string;
  brand: string;
  title: string;
  price: string;
  size: string | null;
  image: string;
};

const EMPTY: Fields = { name: "", email: "", phone: "", size: "", notes: "" };

export function BuyButton({ piece }: { piece: BuyPiece }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn-solid w-full" onClick={() => setOpen(true)}>
        Buy now
      </button>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-muted">{piece.title}</p>
            <p className="text-[16px] font-medium text-ink">{piece.price}</p>
          </div>
          <button type="button" className="btn-solid min-h-12 shrink-0 px-8" onClick={() => setOpen(true)}>
            Buy now
          </button>
        </div>
      </div>
      {open ? <BuySheet piece={piece} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function BuySheet({ piece, onClose }: { piece: BuyPiece; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [trap, setTrap] = useState("");
  const [fields, setFields] = useState<Fields>({ ...EMPTY, size: piece.size ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useModal(ref);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("input")?.focus();
    window.__hangerLenis?.stop();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.__hangerLenis?.start();
      previous?.focus();
    };
  }, []);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = "Enter an email we can reach you on";
    if (!piece.size && !fields.size.trim()) next.size = "Tell us your size";
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => focusFirstError(formRef.current));
      return;
    }

    setPending(true);
    setFailed(false);
    const payload = {
      itemId: piece.id,
      name: fields.name.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim() || undefined,
      size: fields.size.trim() || undefined,
      notes: fields.notes.trim() || undefined,
      company: trap || undefined,
    };
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setFailed(true);
        return;
      }
      setDone(fields.name.trim().split(/\s+/)[0] ?? "");
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(23,19,15,0.5)] backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[94dvh] w-full max-w-[520px] flex-col overflow-y-auto bg-paper text-body shadow-[0_30px_80px_rgba(23,19,15,0.35)] [animation:riseIn_420ms_cubic-bezier(0.22,0.8,0.22,1)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <p className="eyebrow" id={titleId}>
            {done ? "Request received" : "Expression of intent to buy"}
          </p>
          <button type="button" className="-mr-2 flex h-10 w-10 items-center justify-center text-ink" aria-label="Close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 border-b border-line px-6 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={piece.image} alt="" className="tile h-24 w-20 shrink-0 object-contain p-1" />
          <div className="min-w-0">
            <p className="eyebrow">{piece.brand}</p>
            <p className="display mt-1 text-[22px] text-ink">{piece.title}</p>
            <p className="mt-2 text-[15px] font-medium text-ink">{piece.price}</p>
          </div>
        </div>

        {done != null ? (
          <div className="px-6 py-8" role="status">
            <p className="display text-[32px] text-ink">Thank you{done ? `, ${done}` : ""}</p>
            <p className="mt-4 text-[15px] leading-relaxed">
              Your intent to buy is with us. Your personal checkout link will be sent to {fields.email.trim()}.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">No payment is taken until you complete your checkout.</p>
            <button type="button" className="pill-btn mt-8 w-full" onClick={onClose}>
              Continue shopping
            </button>
          </div>
        ) : (
          <form ref={formRef} className="relative grid gap-5 px-6 py-6" onSubmit={submit} noValidate>
            <Honeypot value={trap} onChange={setTrap} />
            <p className="text-[15px] leading-relaxed">
              Pieces this rare are sold by private checkout. Leave your details and your personal checkout link will follow by email.
            </p>
            <Field label="Name" error={errors.name}>
              <input className="field" name="name" autoComplete="name" value={fields.name} onChange={(event) => set("name", event.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className="field" name="email" type="email" autoComplete="email" value={fields.email} onChange={(event) => set("email", event.target.value)} />
            </Field>
            <Field label="Phone, optional" error={errors.phone}>
              <input className="field" name="phone" type="tel" autoComplete="tel" value={fields.phone} onChange={(event) => set("phone", event.target.value)} />
            </Field>
            {piece.size ? (
              <div>
                <p className="field-label">Size</p>
                <p className="mt-2 inline-flex min-h-11 items-center border border-ink px-4 text-[14px] font-medium text-ink">{piece.size}</p>
              </div>
            ) : (
              <Field label="Your size" error={errors.size}>
                <input className="field" name="size" placeholder="M, or 50" value={fields.size} onChange={(event) => set("size", event.target.value)} />
              </Field>
            )}
            <Field label="Anything we should know, optional" error={errors.notes}>
              <textarea className="field min-h-24" name="notes" value={fields.notes} onChange={(event) => set("notes", event.target.value)} />
            </Field>
            {failed ? (
              <p role="alert" className="text-[13px] text-[#8a2f22]">
                That did not go through. Check your connection and try again.
              </p>
            ) : null}
            <button type="submit" className="btn-solid w-full" disabled={pending}>
              {pending ? "Sending" : "Confirm intent to buy"}
            </button>
            <p className="text-center text-[12px] text-muted">No payment is taken now.</p>
            <PrivacyNote />
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

