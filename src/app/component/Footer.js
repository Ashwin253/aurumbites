export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="border-b border-white/10 pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-gold">
            Aurum Bites
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-white md:text-3xl pb-2">
            Premium dairy sourcing for retail, horeca, and bulk enquiries.
          </h2>
          
        </div>
 <p className="text-neutral-400">
                Monday to Saturday, 9:00 AM to 6:00 PM
              </p>
            
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {/* <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Info
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-400">
              Reach out for product availability, sourcing support, delivery
              planning, or partnership conversations across Delhi NCR and nearby
              regions.
            </p>
          </div> */}

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Contact
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <a href="tel:+919711036369" className="transition hover:text-white">
                  +91 97110 36369
                </a>
              </p>
              <p>
                <a href="tel:+919654979085" className="transition hover:text-white">
                  +91 96549 79085
                </a>
              </p>
              <p>
                <a
                  href="mailto:info@aurumbites.co.in"
                  className="transition hover:text-white"
                >
                  info@aurumbites.co.in
                </a>
              </p>
             </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-400">
              Address
            </h3>
            <a
              href="https://maps.app.goo.gl/DXYfqxWQf7QfGM349"
              target="_blank"
              rel="noreferrer"
              className="mt-4 block max-w-sm text-sm leading-7 text-neutral-300 transition hover:text-white"
            >
              B-189, Street No. 17, Chhatarpur Enclave Phase 2, Chhatarpur,
              New Delhi, Delhi 110074
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
