export default function ContactInfoBox() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
        Direct Contact
      </h2>

      <p className="mt-2 text-sm text-neutral-600">
        Available from <strong>9:00 AM – 6:00 PM</strong>, Monday to Saturday
        (except public holidays).
      </p>

      <div className="mt-6 space-y-3 text-sm">
        <div>
          📞{" "}
          <a
            href="tel:+919711036369"
            className="font-medium text-neutral-900 hover:underline"
          >
            +91-9711036369
          </a>
        </div>

        <div>
          📞{" "}
          <a
            href="tel:+919654979085"
            className="font-medium text-neutral-900 hover:underline"
          >
            +91-9654979085
          </a>
        </div>

        <div>
          ✉️{" "}
          <a
            href="mailto:info@aurumbites.co.in"
            className="font-medium text-neutral-900 hover:underline"
          >
info@aurumbites.co.in  
          </a>
        </div>
        <div>
          📍{" "}
          <a
            href="https://maps.app.goo.gl/DXYfqxWQf7QfGM349"
            className="font-medium text-neutral-900 hover:underline"
          >
            B, 189, Street No. 17, Chhatarpur Enclave Phase 2,<br/> Chattarpur Enclave, Chhatarpur, New Delhi, Delhi 110074
          </a>
        </div>
      </div>
    </div>
  );
}
