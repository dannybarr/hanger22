"use client";

import { useState } from "react";

export function DropListForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email");
      return;
    }
    const key = "hanger22.droplist";
    const existing = JSON.parse(window.localStorage.getItem(key) || "[]") as string[];
    existing.push(email.trim());
    window.localStorage.setItem(key, JSON.stringify(existing));
    setError("");
    setDone(true);
  }

  if (done) {
    return (
      <p role="status" className="mt-8 text-[15px]">
        You are on the list, on this browser.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
      <label className="sr-only" htmlFor="drop-email">
        Email
      </label>
      <input
        id="drop-email"
        type="email"
        className="field"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button type="submit" className="pill-btn shrink-0">
        Join
      </button>
      {error ? (
        <span role="alert" className="text-[12px] text-[#7a2e2e]">
          {error}
        </span>
      ) : null}
    </form>
  );
}
