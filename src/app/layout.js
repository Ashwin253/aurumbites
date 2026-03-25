import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AddToHomeScreenButton from "./component/AddToHomeScreenButton";
import FloatingCartButton from "./component/FloatingCartButton";
import { getCartState } from "./shop/actions";
import { getStorefrontMode } from "../lib/storefront";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aurum Bites - Premium Dairy Distributors",
  description: "Reliable sourcing and distribution of high-quality dairy products for businesses and consumers.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aurum Bites",
  },
};

export default async function RootLayout({ children }) {
  const cartState = await getCartState();
  const storefrontMode = getStorefrontMode();

  return (
     <html lang="en">
      <body className="bg-neutral-50 text-neutral-900">
        {children}
        <FloatingCartButton
          cart={cartState.cart}
          isConfigured={cartState.isConfigured}
          isEnquiryOnly={storefrontMode.isEnquiryOnly}
        />
        <AddToHomeScreenButton />
      </body>
    </html>
  );
}
