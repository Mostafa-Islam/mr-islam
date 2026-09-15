import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  // Every teacher page checks independently. Middleware can be bypassed;
  // this cannot. A student who guesses the URL gets bounced here.
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/home");

  return (
    <main className="min-h-dvh bg-[#F7F4EF] p-8">
      <h1 className="text-2xl font-semibold text-[#14201C]">
        Welcome, {session.user.name}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Signed in as {session.user.role}.
      </p>
    </main>
  );
}