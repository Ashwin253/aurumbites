// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";

import ContactForm from "../component/ContactForm";
import ContactInfoBox from "../component/ContactInfoBox";
import Navbar from "../component/Navbar";
import { getCartState } from "../shop/actions";

function getLargeOrderRequirement(cart) {
  const isLargeOrder =
    cart.totalQuantity > 5 ||
    (cart.subtotalAmount !== null && cart.subtotalAmount > 2000);

  if (!isLargeOrder || cart.lines.length === 0) {
    return "";
  }

  const itemLines = cart.lines.map((line) => {
    const variantSuffix =
      line.variantTitle &&
      line.variantTitle !== "Default Title" &&
      line.variantTitle !== "Preview item"
        ? ` (${line.variantTitle})`
        : "";

    return `- ${line.title}${variantSuffix} x ${line.quantity}${line.price ? ` - ${line.price}` : ""}`;
  });

  return [
    "Large order enquiry",
    `Total items: ${cart.totalQuantity}`,
    cart.subtotal ? `Cart value: ${cart.subtotal}` : null,
    "Required products:",
    ...itemLines,
    "",
    "Please share bulk pricing, delivery timeline, and availability.",
  ]
    .filter(Boolean)
    .join("\n");
}

export default async function ContactPage() {
  const cartState = await getCartState();
  const initialMessage = getLargeOrderRequirement(cartState.cart);

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
        <ContactForm initialMessage={initialMessage} />
        </div>
      </main>

      {/* <Footer /> */}
    </>
  );
}
