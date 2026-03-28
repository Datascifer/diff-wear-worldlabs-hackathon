import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/layout/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg-base)" }}>
      <main className="flex-1 pb-24">{children}</main>
      <Nav />
    </div>
  );
}
