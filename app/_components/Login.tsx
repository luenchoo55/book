"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { CornerVine, Flourish, Icon } from "./ui";

/* 登入畫面：仿照參考圖的羊皮紙「Welcome Back」卡片，右上角有郵票與郵戳 */
export default function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api("/api/login", { method: "POST", body: { password: pw } });
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100dvh-48px)] place-items-center py-6">
      <form onSubmit={submit} className="paper w-full max-w-[420px] px-[clamp(22px,6vw,40px)] pt-11 pb-8 text-center">
        <CornerVine corner="tl" />
        <CornerVine corner="br" />
        <div className="absolute top-4 right-4 flex items-center gap-1" aria-hidden>
          <span className="postmark-waves h-[22px] w-11" />
          <span className="grid h-14 w-12 rotate-3 place-items-center border-2 border-dashed border-ink/60 bg-paper-2 p-1">
            <span className="grid size-full place-items-end justify-center bg-linear-to-b from-sky via-sage to-leaf pb-0.5 font-elite text-[8px] font-bold text-paper">LIBRARY</span>
          </span>
        </div>

        <h2 className="mt-7 font-elite text-[38px] leading-tight font-extrabold tracking-wide">Welcome Back</h2>
        <p className="mt-1.5 font-zh text-xl font-bold tracking-[.3em]">歡迎回到圖書館</p>
        <p className="mt-2.5 text-base leading-relaxed text-muted">
          Good to see you again.
          <br />
          輸入密碼，繼續你的閱讀旅程。
        </p>

        <Flourish className="my-5" />

        <label className="relative block">
          <span className="sr-only">密碼</span>
          <Icon name="lock" className="absolute top-1/2 left-3.5 -translate-y-1/2 text-ink" />
          <input
            className="input min-h-[50px] pr-11 pl-11"
            type={show ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "隱藏密碼" : "顯示密碼"} className="absolute top-1/2 right-1.5 grid size-[38px] -translate-y-1/2 place-items-center text-ink">
            <Icon name={show ? "eyeOff" : "eye"} />
          </button>
        </label>

        {err && <p className="mt-3 font-zh text-sm text-berry">{err}</p>}

        <button className="btn btn-pri mt-5 min-h-[50px] w-full font-elite text-lg tracking-[.12em]" disabled={busy || !pw}>
          {busy ? "Opening…" : "Log In"}
        </button>

        <svg className="mx-auto mt-7 text-ink/55" width="90" height="26" viewBox="0 0 90 26" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="M2 24 28 6l10 9 12-11 20 14 18 6M38 15l-6 9M50 4l4 10" />
        </svg>
        <p className="mt-2 font-elite text-sm font-bold tracking-[.08em] text-muted italic">Small steps. Big dreams.</p>
      </form>
    </div>
  );
}
