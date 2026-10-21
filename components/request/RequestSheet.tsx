"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Fields = {
  name: string;
  email: string;
  size: string;
  budget: string;
  notes: string;
};

const EMPTY: Fields = { name: "", email: "", size: "", budget: "", notes: "" };

export function RequestSheet({
  itemId,
  title,
  onClose,
}: {
  itemId?: string;
  title?: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("input")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      previous?.focus();
    };
  }, []);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!fields.name.trim()) next.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = "Enter a valid email";
    if (fields.budget.trim() && Number.isNaN(Number(fields.budget))) next.budget = "Budget should be a number";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          itemId,
          name: fields.name.trim(),
          email: fields.email.trim(),
          size: fields.size.trim() || undefined,
          budgetGBP: fields.budget.trim() ? Number(fields.budget) : undefined,
          notes: fields.notes.trim() || undefined,
        }),
      });
      const body = (await response.json()) as { id?: string; error?: string };
      if (!response.ok) {
        setFailed(true);
        return;
      }
      const stored = {
        id: body.id,
        itemId,
        name: fields.name.trim(),
        email: fields.email.trim(),
        size: fields.size.trim() || undefined,
        budgetGBP: fields.budget.trim() ? Number(fields.budget) : undefined,
        notes: fields.notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        status: "new",
      };
      const key = "hanger22.requests";
      const existing = JSON.parse(window.localStorage.getItem(key) || "[]") as unknown[];
      existing.push(stored);
      window.localStorage.setItem(key, JSON.stringify(existing));
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-0 sm:place-items-center sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92dvh] w-full overflow-auto bg-paper p-6 text-body shadow-xl sm:max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Request</p>
            <h2 id={titleId} className="display mt-1 text-[26px] text-ink">
              {title ?? "A piece"}
            </h2>
          </div>
          <button type="button" className="nav-link" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-muted">
          Nothing is charged here. We write the request to this browser and to the desk log.
        </p>
        {done ? (
          <p role="status" className="mt-8 text-[15px] text-body">
            Request received. We will reply by email.
          </p>
        ) : (
          <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
            <Field label="Name" error={errors.name}>
              <input className="field" name="name" autoComplete="name" value={fields.name} onChange={(event) => set("name", event.target.value)} required />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className="field" name="email" type="email" autoComplete="email" value={fields.email} onChange={(event) => set("email", event.target.value)} required />
            </Field>
            <Field label="Size" error={errors.size}>
              <input className="field" name="size" value={fields.size} onChange={(event) => set("size", event.target.value)} />
            </Field>
            <Field label="Budget, GBP" error={errors.budget}>
              <input className="field" name="budget" inputMode="decimal" value={fields.budget} onChange={(event) => set("budget", event.target.value)} />
            </Field>
            <Field label="Notes" error={errors.notes}>
              <textarea className="field min-h-24" name="notes" value={fields.notes} onChange={(event) => set("notes", event.target.value)} />
            </Field>
            {failed ? (
              <p role="alert" className="text-[13px] text-[#7a2e2e]">
                The request did not go through. Try again in a moment.
              </p>
            ) : null}
            <button type="submit" className="pill-btn w-fit" disabled={pending}>
              {pending ? "Sending" : "Send request"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-[12px] tracking-[0.08em] text-muted uppercase">
      {label}
      {children}
      {error ? (
        <span role="alert" className="text-[12px] tracking-normal text-[#7a2e2e] normal-case">
          {error}
        </span>
      ) : null}
    </label>
  );
}
