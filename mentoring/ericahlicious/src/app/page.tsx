import Link from "next/link";
import { auth } from "@/auth";

export default async function CustomerLandingPage() {
  const session = await auth();

  return (
    <div className="customer-layout">
      {/* Hero section */}
      <div className="customer-hero">
        {/* We use a colored gradient placeholder instead of a real image to ensure it loads perfectly */}
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(135deg, hsl(30, 40%, 60%), hsl(25, 40%, 40%))",
          position: "absolute", inset: 0
        }} />
        <div className="customer-hero-overlay" />
      </div>

      <div className="customer-brand">
        <div className="customer-logo">E</div>
        <div className="flex-col items-center">
          <h1 className="customer-title">Erichalicious</h1>
          <div className="customer-subtitle">Brew & Bake</div>
        </div>

        <Link href="/menu-customer" className="btn-start-ordering mt-8">
          Start Ordering
        </Link>
      </div>

      {/* Staff Login Link at the bottom */}
      <div style={{ position: "fixed", bottom: 20, width: "100%", maxWidth: 430, textAlign: "center" }}>
        <Link href={session?.user ? "/dashboard" : "/login"} style={{ fontSize: 12, color: "hsl(30, 20%, 60%)", textDecoration: "underline" }}>
          Staff Login
        </Link>
      </div>
    </div>
  );
}
