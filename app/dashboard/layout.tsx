import NavBar from "@/app/components/NavBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
