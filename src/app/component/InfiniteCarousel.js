import Image from "next/image";

/**
 * A reusable infinite horizontal carousel component.
 */
export default function InfiniteCarousel({
  title,
  description,
  items,
  trackClassName,
  gapClass = "gap-4",
  gradientColor = "from-white",
  footerNote,
  renderItem,
}) {
  // Duplicate items for the seamless loop effect
  const displayItems = [...items, ...items];

  return (
    <section className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-neutral-600">
              {description}
            </p>
          )}
        </div>

        <div className="relative mt-12 overflow-hidden">
          {/* Fade gradients */}
          <div className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r ${gradientColor} to-transparent`} />
          <div className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l ${gradientColor} to-transparent`} />

          <div className={`${trackClassName} flex w-max items-center ${gapClass}`}>
            {displayItems.map((item, index) => (
              <div key={`${item.name}-${index}`}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        </div>

        {footerNote && (
          <p className="mt-8 text-xs text-neutral-500">
            {footerNote}
          </p>
        )}
      </div>
    </section>
  );
}