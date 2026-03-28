import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // is_staff read from DB — never from JWT
  const { data: profile } = await supabase
    .from("users")
    .select("is_staff, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_staff) redirect("/feed");

  return (
    <div className="min-h-dvh" style={{ background: "#0a0012" }}>
      <header
        className="sticky top-0 z-10 px-6 py-4 flex items-center gap-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "#0a0012" }}
      >
        <span
          className="text-lg font-bold text-white"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          Diiff Staff
        </span>
        <nav className="flex gap-4 ml-4">
          <a href="/admin/moderation" className="text-white/60 hover:text-white text-sm transition-colors">
            Moderation
          </a>
          <a href="/admin/users" className="text-white/60 hover:text-white text-sm transition-colors">
            Users
          </a>
        </nav>
        <span className="ml-auto text-white/30 text-xs">
          Signed in as {profile.display_name as string}
        </span>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
