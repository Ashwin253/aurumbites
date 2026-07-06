import { getInventory, getMessages, getCategories, getBrands, getOrders, getOffers, getTeamMembers, getAllowedEmails, getAuthUser } from "./actions";
import DataDashboard from "./DataDashboard";
import Navbar from "../component/Navbar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Data Dashboard - Aurum Bites",
  description: "Manage inventory and view messages.",
};

export default async function DataPage() {
  const [products, messages, categories, brands, orders, offers, teamMembers, allowedEmails, currentUser] = await Promise.all([
    getInventory(),
    getMessages(),
    getCategories(),
    getBrands(),
    getOrders(),
    getOffers(),
    getTeamMembers(),
    getAllowedEmails(),
    getAuthUser(),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-neutral-50/50">
        <DataDashboard 
          initialProducts={products} 
          initialMessages={messages} 
          initialCategories={categories}
          initialBrands={brands}
          initialOrders={orders}
          initialOffers={offers}
          initialTeamMembers={teamMembers}
          initialAllowedEmails={allowedEmails}
          currentUser={currentUser}
        />
      </main>
    </>
  );
}
