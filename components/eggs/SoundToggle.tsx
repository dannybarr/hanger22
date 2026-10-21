"use client";

import { SpeakerHigh } from "@phosphor-icons/react/dist/ssr/SpeakerHigh";
import { SpeakerSlash } from "@phosphor-icons/react/dist/ssr/SpeakerSlash";
import { useEffect, useState } from "react";

export function SoundToggle({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <span className="h-8 w-8" />;
  const Icon = on ? SpeakerHigh : SpeakerSlash;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Hanger sound on" : "Hanger sound off"}
      title="Hanger sound is off until you turn it on"
      className="grid h-8 w-8 place-items-center text-muted"
      onClick={() => onChange(!on)}
    >
      <Icon size={16} />
    </button>
  );
}
