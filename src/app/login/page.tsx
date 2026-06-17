import Image from "next/image";
import { FileText, FolderClosed, KeyRound, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/auth-form";

const highlights = [
  { icon: FolderClosed, text: "All your projects in one elegant workspace" },
  { icon: KeyRound, text: "Environment variables, scoped and secure" },
  { icon: FileText, text: "Docs and READMEs at your fingertips" },
  { icon: ShieldCheck, text: "Fast, reliable, and built for teams" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[var(--brand-navy)] via-[var(--brand-blue)] to-[var(--brand-cyan)] p-12 lg:flex lg:flex-col lg:justify-between">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-[var(--brand-cyan)]/20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center rounded-2xl bg-white px-6 py-4 shadow-lg">
            <Image
              src="/devminified-logo.svg"
              alt="Devminified"
              width={240}
              height={62}
              priority
              className="h-12 w-auto"
            />
          </div>
        </div>

        <div className="relative max-w-xl">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            Transforming the digital landscape.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-blue-100/90">
            Welcome to the Devminified Project Hub — manage every project,
            environment, and document from a single, beautiful place.
          </p>

          <ul className="mt-10 space-y-5">
            {highlights.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-4 text-base text-white"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
                  <Icon className="size-5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-blue-100/70">
          © {2026} Devminified. All rights reserved.
        </p>
      </div>

      {/* Right — auth form */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        {/* Mobile logo (left panel is hidden) */}
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src="/devminified-logo.svg"
              alt="Devminified"
              width={200}
              height={52}
              priority
              className="h-11 w-auto"
            />
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
