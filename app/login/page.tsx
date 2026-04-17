// app/login/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInButton from "@/app/components/SignInButton";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] flex flex-col lg:flex-row">

      {/* ── Animated blobs ── */}
      <div className="pointer-events-none absolute -left-28 -top-24 h-[500px] w-[500px] animate-blob-slow rounded-full bg-purple-600/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] animate-blob-med rounded-full bg-emerald-500/15 blur-[80px]" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[280px] w-[280px] animate-blob-fast rounded-full bg-pink-500/10 blur-[80px]" />

      {/* ── Grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ══════════════════════════════
           LEFT PANEL — Brand / Hero
         ══════════════════════════════ */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-20 xl:px-24 2xl:px-32 items-center text-center lg:items-start lg:text-left">

        {/* Floating feature cards — hidden on mobile/tablet */}
        <div className="pointer-events-none absolute right-[8%] top-[18%] hidden xl:flex animate-float-med items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <span className="text-xl">📊</span>
          <div>
            <p className="text-[13px] font-medium text-white">Smart Analytics</p>
            <p className="text-[12px] text-white/50">Monthly insights & trends</p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[22%] right-[5%] hidden xl:flex animate-float-slow items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-[13px] font-medium text-white">Savings Goals</p>
            <p className="text-[12px] text-white/50">Track your targets</p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[12%] left-[52%] hidden xl:flex animate-float-fast items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <span className="text-xl">💹</span>
          <div>
            <p className="text-[13px] font-medium text-white">Investment Tips</p>
            <p className="text-[12px] text-white/50">AI-powered suggestions</p>
          </div>
        </div>

        {/* Brand */}
        <div className="mb-10 flex animate-fade-up items-center gap-3 lg:mb-16">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-lg shadow-lg shadow-purple-900/40">
            💰
          </div>
          <span
            className="text-[20px] font-semibold tracking-tight text-white"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            MyExpense
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mb-5 animate-fade-up-2 text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.1] font-bold text-white"
          style={{ fontFamily: "'DM Serif Display', serif", animationDelay: "0.1s" }}
        >
          Take control of your{" "}
          <em
            className="not-italic"
            style={{
              background: "linear-gradient(135deg,#a78bfa,#34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            financial
          </em>{" "}
          future
        </h1>

        {/* Subtext */}
        <p
          className="mb-10 max-w-[420px] animate-fade-up-3 text-[clamp(0.95rem,1.4vw,1.1rem)] font-light leading-relaxed text-white/40 lg:mb-16"
          style={{ animationDelay: "0.2s" }}
        >
          Track every rupee, crush your goals, and grow your wealth — all in
          one beautifully simple dashboard.
        </p>

        {/* Stats */}
        <div
          className="flex flex-wrap justify-center gap-8 animate-fade-up-4 lg:justify-start lg:gap-12"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            { num: "₹2.4L+", label: "avg. saved" },
            { num: "98%",    label: "accuracy"  },
            { num: "10k+",   label: "users"     },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-[clamp(1.3rem,2vw,1.6rem)] font-medium text-white">
                {num}
              </span>
              <span className="text-[11px] uppercase tracking-widest text-white/30">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
           RIGHT PANEL — Auth Card
         ══════════════════════════════ */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-10 sm:px-8 sm:py-12 lg:w-[420px] xl:w-[460px] 2xl:w-[500px] lg:py-0">

        {/* Decorative rotating rings */}
        <div className="pointer-events-none absolute hidden lg:block h-[380px] w-[380px] animate-spin-slow rounded-full border border-dashed border-violet-500/20 xl:h-[440px] xl:w-[440px]" />
        <div className="pointer-events-none absolute hidden lg:block h-[460px] w-[460px] animate-spin-reverse rounded-full border border-dashed border-emerald-500/15 xl:h-[540px] xl:w-[540px]" />

        <div className="w-full max-w-[400px] animate-fade-up rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-[40px] sm:p-10 2xl:p-12">

          <p className="mb-5 text-[11px] uppercase tracking-[1.5px] text-white/25">
            Welcome back
          </p>

          <h2
            className="mb-2 text-[clamp(1.5rem,2.5vw,1.9rem)] leading-tight text-white"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Sign in to<br />MyExpense
          </h2>

          <p className="mb-8 text-[14px] text-white/35">
            Your finances, beautifully organised.
          </p>

          {/* Google Sign-In button wrapper */}
          <div className="mb-5">
            <SignInButton />
          </div>

          <div className="mb-5 flex items-center gap-3 text-[12px] text-white/20">
            <span className="h-px flex-1 bg-white/8" />
            or email sign-in coming soon
            <span className="h-px flex-1 bg-white/8" />
          </div>

          {/* Feature bullets */}
          <ul className="mb-8 flex flex-col gap-3">
            {[
              { color: "bg-emerald-400 shadow-emerald-400/50",  text: "Track salary, income & daily expenses"      },
              { color: "bg-violet-400 shadow-violet-400/50",    text: "Smart savings goals with progress tracking" },
              { color: "bg-amber-400 shadow-amber-400/50",      text: "AI-powered investment suggestions"          },
            ].map(({ color, text }) => (
              <li key={text} className="flex items-center gap-3 text-[13px] text-white/45">
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full shadow-md ${color}`} />
                {text}
              </li>
            ))}
          </ul>

          <p className="text-center text-[11px] leading-relaxed text-white/20">
            By continuing, you agree to our{" "}
            <a href="#" className="text-white/40 hover:text-white/70 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-white/40 hover:text-white/70 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}