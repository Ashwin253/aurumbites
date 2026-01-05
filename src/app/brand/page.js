import Navbar from "../component/Navbar";

export const metadata = {
  title: "Brand Guidelines – FROND",
  description: "Official brand colors, typography, logo usage and design system for FROND",
};

export default function BrandPage() {
  return (
    <main>
        <Navbar/>
      {/* Header */}
      <section className="max-w-6xl mx-auto my-20">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Brand Guidelines
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          Visual identity, colors, typography, and usage guidelines for FROND.
        </p>
      </section>

      {/* Colors */}
      <section className="max-w-6xl mx-auto mb-24">
        <h2 className="text-3xl font-bold mb-10">Colors</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Primary */}
          <ColorCard
            title="Primary"
            name="Midnight Blue"
            hex="#0b1537"
            usage="Backgrounds, navigation, headers"
            bg="#0b1537"
            text="text-white"
          />

          {/* Secondary */}
          <ColorCard
            title="Secondary"
            name="Soft Sand"
            hex="#fde4bc"
            usage="Highlights, cards, accents"
            bg="#fde4bc"
            text="text-[#0b1537]"
          />

          {/* Button */}
          {/* <ColorCard
            title="Action"
            name="Action Blue"
            hex="#0abf55"
            usage="Primary CTAs & buttons"
            bg="#0abf55"
            text="text-white"
          /> */}
        </div>
      </section>

      {/* Typography */}
      <section className="max-w-6xl mx-auto mb-24">
        <h2 className="text-3xl font-bold mb-8">Typography</h2>

        <div className="bg-white/5 rounded-2xl p-8">
          <p className="text-xl font-semibold mb-4">Primary Font</p>

          <p className="text-4xl font-bold mb-3">Inter</p>
          <p className="text-white/80 max-w-2xl">
            Inter is used across the product for its clarity, readability, and
            neutral tone—ideal for information-heavy interfaces.
          </p>

          <div className="mt-8 space-y-3">
            <p className="text-3xl font-bold">Heading Example</p>
            <p className="text-lg">
              Body text example designed for long-form readability and calm UX.
            </p>
            <p className="text-sm text-white/60">
              Caption / metadata text
            </p>
          </div>
        </div>
      </section>

     {/* Buttons */}
<section className="max-w-6xl mx-auto mb-24">
  <h2 className="text-3xl font-bold mb-8">Buttons</h2>

  <div className="flex flex-wrap items-center gap-6">
    {/* Primary CTA */}
    <button className="
      px-7 py-3
      rounded-xl
      bg-[#0abf55]
      text-white
      font-semibold
      shadow-md
      hover:bg-[#B45309]
      transition
    ">
      Request Supply
    </button>

    {/* Secondary CTA */}
    <button className="
      px-7 py-3
      rounded-xl
      border
      border-[#15803D]
      text-[#15803D]
      font-semibold
      hover:bg-[#15803D]/10
      transition
    ">
      View Product List
    </button>
  </div>

  <p className="mt-6 max-w-xl text-white/70">
    Buttons are designed to reflect freshness, reliability, and decisive action
    — avoiding loud or overly corporate tones.
  </p>
</section>

      {/* Logo */}
      <section className="max-w-6xl mx-auto mb-24">
        <h2 className="text-3xl font-bold mb-8">Logo</h2>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-2xl  flex items-center justify-center">
            <img
              src="/logo.jpg"
              alt="Aurumbites Logo"
            className="max-h-20"
            />
          </div>

          <div className="space-y-3 text-white/80">
            <p>✔ Maintain clear space around the logo</p>
            <p>✔ Use approved color variants only</p>
            <p>✘ Do not stretch or distort</p>
            <p>✘ Do not apply gradients or shadows</p>
          </div>
        </div>
      </section>

      {/* Brand Personality */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Brand Personality</h2>

        <div className="bg-[#fde4bc] text-[#0b1537] rounded-2xl p-10">
          <p className="text-xl font-semibold mb-4">
            Calm. Informative. Intentional.
          </p>
          <p className="max-w-3xl text-lg">
           Aurumbites represents a trustworthy partner in the dairy industry,
           focusing on quality, reliability, and clear communication. Our brand
           tone is professional yet approachable, aiming to build lasting
           relationships with both B2B and D2C customers.
          </p>
        </div>
      </section>
    </main>
  );
}

/* ---------- Components ---------- */

function ColorCard({ title, name, hex, usage, bg, text }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <div
        className="h-32 flex items-end p-4"
        style={{ backgroundColor: bg }}
      >
        <span className={`font-semibold ${text}`}>{hex}</span>
      </div>

      <div className="p-6 bg-white/5">
        <p className="text-sm uppercase tracking-wide text-white/60">
          {title}
        </p>
        <h3 className="text-xl font-bold mt-1">{name}</h3>
        <p className="text-white/70 mt-2">{usage}</p>
      </div>
    </div>
  );
}
