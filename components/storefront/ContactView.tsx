"use client";

import { useLang } from "../LangContext";

const PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || "01287566246";
const WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
  "https://chat.whatsapp.com/Es1cmi0a7Mp8Qz4PtyiDgF?mode=hqctcli";

export function ContactView() {
  const { dict } = useLang();
  return (
    <div className="max-w-3xl mx-auto space-y-8 text-center">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold glow-text">{dict.contact.title}</h1>
        <p className="opacity-80 mt-3">{dict.contact.subtitle}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <a
          href={`tel:${PHONE}`}
          className="card neon-border p-8 group hover:-translate-y-0.5 transition flex flex-col items-center gap-3"
        >
          <div className="h-14 w-14 grid place-items-center rounded-full bg-brand-700/30 text-2xl">📞</div>
          <h2 className="text-xl font-semibold">{dict.contact.callUs}</h2>
          <p className="font-mono text-lg" dir="ltr">
            {PHONE}
          </p>
          <span className="btn-primary mt-1 group-hover:shadow-neon-purple">{dict.contact.callBtn}</span>
        </a>

        <a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          className="card neon-border p-8 group hover:-translate-y-0.5 transition flex flex-col items-center gap-3"
        >
          <div className="h-14 w-14 grid place-items-center rounded-full bg-emerald-600/30 text-2xl">💬</div>
          <h2 className="text-xl font-semibold">{dict.contact.whatsapp}</h2>
          <p className="opacity-70 text-xs break-all">{WHATSAPP}</p>
          <span className="btn-primary mt-1" style={{ background: "linear-gradient(135deg,#10b981,#22d3ee)" }}>
            {dict.contact.whatsappBtn}
          </span>
        </a>
      </div>
    </div>
  );
}
