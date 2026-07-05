import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Register Teammate - Aurum Bites",
  description: "Register your teammate account.",
};

export default async function RegisterPage() {
  return <RegisterForm />;
}
