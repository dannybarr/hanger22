"use client";

import Link from "next/link";
import { cloneElement, isValidElement, useEffect, useId, type ReactElement, type RefObject } from "react";

/** Label, control and error, wired so screen readers announce the error with the field. */
export function Field({ label, error, children }: { label: string; error?: string; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  const errorId = `${id}-error`;
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined })
    : children;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {control}
      {error ? (
        <span id={errorId} className="text-[13px] text-[#8a2f22]">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** Hidden from people, tempting to bots. Anything typed here marks the message as spam. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company
        <input tabIndex={-1} autoComplete="off" name="company" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    </div>
  );
}

export function PrivacyNote() {
  return (
    <p className="text-[12px] leading-relaxed text-muted">
      We use your details only to reply and to handle your piece. See our{" "}
      <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink">
        privacy notice
      </Link>
      .
    </p>
  );
}

/** Move focus to the first field with an error after a failed submit. */
export function focusFirstError(form: HTMLElement | null) {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}

/**
 * Makes an open dialog modal for keyboard and screen reader users: everything
 * outside it goes inert, and Tab cycles inside it.
 */
export function useModal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const host = dialog.closest("body > *") as HTMLElement | null;
    const siblings = [...document.body.children].filter((node) => node !== host) as HTMLElement[];
    const previous = siblings.map((node) => node.inert);
    siblings.forEach((node) => {
      node.inert = true;
    });
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([tabindex="-1"]), textarea, select')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      siblings.forEach((node, index) => {
        node.inert = previous[index] ?? false;
      });
      document.removeEventListener("keydown", onKey);
    };
  }, [ref]);
}
