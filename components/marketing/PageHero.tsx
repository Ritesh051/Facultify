import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <section
      className="pt-36 pb-16 sm:pt-44 sm:pb-20"
      style={{
        background:
          "linear-gradient(160deg, #F8FAFF 0%, #EEF2FF 55%, #F5F3FF 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-4xl px-6 lg:px-12 text-center">
        <div className="inline-flex items-center gap-2 mb-5">
          <span
            className="block w-5 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #3B6FFF)" }}
            aria-hidden="true"
          />
          <span
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{ color: "#3B6FFF" }}
          >
            {eyebrow}
          </span>
          <span
            className="block w-5 h-px"
            style={{ background: "linear-gradient(90deg, #3B6FFF, transparent)" }}
            aria-hidden="true"
          />
        </div>

        <h1
          className="text-4xl sm:text-5xl font-black leading-[1.08] tracking-[-0.03em]"
          style={{ color: "#0F172A" }}
        >
          {title}
        </h1>

        {description && (
          <p className="mt-5 text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "#475569" }}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
