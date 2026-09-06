"use client";

export function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="w-full bg-[hsl(var(--navy-light))] hover:bg-[hsl(var(--navy-hover))] text-white text-sm py-3 text-center transition-colors"
    >
      Back to top
    </button>
  );
}
