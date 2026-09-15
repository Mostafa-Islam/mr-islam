import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "TEACHER") redirect("/dashboard");

  // Query enrollments, not groups. A student must only ever see groups
  // they're enrolled in — filtering by studentId here is what enforces
  // that, and it can't be bypassed from the browser.
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    // include pulls in the related Group row via the foreign key.
    // select inside it keeps the payload to what's rendered.
    include: {
      group: { select: { id: true, name: true, schedule: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <main className="min-h-dvh bg-[#F7F4EF] px-6 py-8">
      <div className="mx-auto max-w-sm">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-600">Good evening</p>
            <h1 className="text-xl font-semibold text-[#14201C]">
              {session.user.name}
            </h1>
          </div>
          <LogoutButton />
        </header>

        <section className="mt-8">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Your groups · {enrollments.length}
          </h2>

          {enrollments.length === 0 ? (
            <p className="text-sm text-neutral-600">
              You're not in a class yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {enrollments.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <p className="font-medium text-[#14201C]">{e.group.name}</p>
                  {e.group.schedule && (
                    <p className="mt-1 text-sm text-neutral-600">
                      {e.group.schedule}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}