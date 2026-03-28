export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh" style={{ background: "#0a0012" }}>
      <header className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <a
          href="/"
          className="text-white/60 text-sm hover:text-white transition-colors"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          ← Diiff
        </a>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
