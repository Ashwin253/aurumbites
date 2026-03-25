const badges = [
  {
    title: "FSSAI Aligned",
    desc: "Operations aligned with FSSAI food safety regulations.",
  },
  {
    title: "ISO-Oriented Processes",
    desc: "Quality benchmarks inspired by ISO food safety standards.",
  },
  {
    title: "Cold-Chain Aware",
    desc: "Temperature-controlled handling across logistics.",
  },
  {
    title: "Supplier Audits",
    desc: "Partner selection based on hygiene and quality checks.",
  },
];

export default function QualityBadges() {
  return (
    <section className="bg-white border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Quality & Compliance
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-600">
          Built around regulatory alignment, food safety, and consistency.
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="glossy-card rounded-2xl bg-white/55 ring-1 ring-black/45 p-6 transition hover:bg-white/10"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-black">
                {badge.title}
              </h3>
              <p className="mt-3 text-sm text-neutral-700">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
