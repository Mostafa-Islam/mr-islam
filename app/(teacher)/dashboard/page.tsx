import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PendingStudents } from "./pending-students";
import { LogoutButton } from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/home");

  // Two independent queries, so Promise.all runs them at the same time
  // rather than waiting for the first to finish before starting the second.
  const [pending, groups] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", status: "PENDING" },
      // select, not the whole row — never pull the password hash into
      // memory, let alone into a component that ships to the browser.
      select: { id: true, name: true, phone: true, grade: true },
      orderBy: { createdAt: "asc" },   // longest wait first
    }),
    prisma.group.findMany({
      where: { archived: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="min-h-dvh bg-[#F7F4EF] p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#14201C]">
              {session.user.name}
            </h1>
            <p className="text-sm text-neutral-600">Teacher dashboard</p>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">
            Waiting for approval · {pending.length}
          </h2>
          <PendingStudents students={pending} groups={groups} />
        </section>
      </div>
    </main>
  );
}