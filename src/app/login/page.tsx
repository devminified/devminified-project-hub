import Image from "next/image";
import { FileText, Folder, Key, ShieldCheck, type LucideIcon } from "lucide-react";

import { AuthForm } from "@/components/auth-form";

const highlights: { icon: LucideIcon; text: string }[] = [
  { icon: Folder, text: "All your projects in one elegant workspace" },
  { icon: Key, text: "Environment variables, scoped and secure" },
  { icon: FileText, text: "Docs and READMEs at your fingertips" },
  { icon: ShieldCheck, text: "Fast, reliable, and built for teams" },
];

/**
 * The split sign-in screen from the Devminified design system ("Project Hub"
 * sign-in board): a navy brand panel on the left, the form centred on the
 * white panel to its right.
 *
 * The brand panel is decorative and drops out below `lg`, where the form takes
 * the full width. Its headline is a <p>, not a heading: the page's real <h1>
 * belongs to the form ("Welcome back"), which is the one thing every viewport
 * renders.
 */
export default function LoginPage() {
  return (
    <div className="font-body flex min-h-screen items-stretch bg-[#F4F7FB] text-[#0B1B33]">
      <div className="hidden min-w-0 flex-1 basis-1/2 flex-col justify-between bg-[#0A1B38] px-[52px] py-11 text-white lg:flex">
        <div className="my-auto max-w-[30ch]">
          <p
            className="dm-animate-in font-display text-[42px] leading-[1.12] font-bold tracking-[-0.03em]"
            style={{ animationDelay: "0.05s" }}
          >
            Transforming the digital landscape.
          </p>
          <p
            className="dm-animate-in mt-4 mb-9 max-w-[40ch] text-[15px] leading-[1.6] text-[#93A7C6]"
            style={{ animationDelay: "0.15s" }}
          >
            Welcome to the Devminified Project Hub — manage every project,
            environment, and document from a single place.
          </p>

          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {highlights.map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="dm-animate-in flex items-center gap-3.5 text-[15px]"
                style={{ animationDelay: `${0.25 + i * 0.08}s` }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-[#122A52] text-[#7FA9FF]">
                  <Icon className="size-[19px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="dm-animate-in text-[13px] text-[#6E86AC]"
          style={{ animationDelay: "0.6s" }}
        >
          © 2026 Devminified. All rights reserved.
        </div>
      </div>

      <div className="relative grid min-w-0 flex-1 basis-1/2 place-items-center bg-white px-8 py-12">
        {/* The wordmark is the dark-navy mark, so it sits on the white panel
            rather than the brand panel, where it would disappear. Source is the
            2766x608 master with its transparent padding trimmed off, so the
            mark fills the box it is given at any density. */}
        <Image
          src="/devminified-logo.png"
          alt="Devminified"
          width={2766}
          height={608}
          priority
          quality={100}
          sizes="200px"
          className="dm-animate-in absolute top-8 right-8 h-7 w-auto sm:h-8 lg:right-[52px] lg:h-9"
        />

        <div className="w-full max-w-[384px]">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
