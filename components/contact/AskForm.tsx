"use client";

import { useState } from "react";

type Fields = { name: string; email: string; notes: string; budget: string };

const EMPTY: Fields = { name: "", email: "", notes: "", budget: "" };

/** Ask for a piece that is not on the rail, or ask anything else. */
export function AskForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = "Enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) next.email = "Enter an email we can reach you on";
    if (!fields.notes.trim()) next.notes = "Tell us what you are looking for";
    const budget = fields.budget.replace(/[£,\s]/g, "");
    if (budget && Number.isNaN(Number(budget))) next.budget = "Use a number, like 1500";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    setFailed(false);
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          notes: fields.notes.trim(),
          budgetGBP: budget ? Number(budget) : undefined,
        }),
      });
      if (!response.ok) {
        setFailed(true);
        return;
      }
      setDone(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="border-t border-ink pt-8">
        <p className="display text-[32px] text-ink">Thank you</p>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed">We have your message and will reply by email. If we find your piece, we will send photographs and a price before anything else.</p>
      </div>
    );
  }

  return (
    <form className="grid gap-5 border-t border-ink pt-8" onSubmit={submit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <input className="field" name="name" autoComplete="name" value={fields.name} onChange={(event) => set("name", event.target.value)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="field" name="email" type="email" autoComplete="email" value={fields.email} onChange={(event) => set("email", event.target.value)} />
        </Field>
      </div>
      <Field label="What are you looking for" error={errors.notes}>
        <textarea
          className="field min-h-32"
          name="notes"
          placeholder="Stone Island x Dior, a Ghost piece in size L, or anything else on your list"
          value={fields.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </Field>
      <Field label="Budget in pounds, optional" error={errors.budget}>
        <input className="field sm:max-w-xs" name="budget" inputMode="decimal" value={fields.budget} onChange={(event) => set("budget", event.target.value)} />
      </Field>
      {failed ? (
        <p role="alert" className="text-[13px] text-[#8a2f22]">
          That did not go through. Check your connection and try again.
        </p>
      ) : null}
      <button type="submit" className="btn-solid w-full sm:w-fit sm:px-12" disabled={pending}>
        {pending ? "Sending" : "Send"}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="field-label">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="text-[13px] text-[#8a2f22]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
