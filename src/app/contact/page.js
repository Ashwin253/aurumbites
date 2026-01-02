// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

import ContactForm from "../component/ContactForm";
import ContactInfoBox from "../component/ContactInfoBox";
import Navbar from "../component/Navbar";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-xl px-6 py-24">
<ContactInfoBox/>
        <h1 className="text-3xl font-semibold mt-2 tracking-tight">
          Contact Us
        </h1>

        <p className="mt-4 text-neutral-600">
          Reach out for B2B enquiries, sourcing details, or partnerships.
        </p>

        <div className="mt-10 space-y-6">
        <ContactForm/>
        </div>
      </main>

      {/* <Footer /> */}
    </>
  );
}
