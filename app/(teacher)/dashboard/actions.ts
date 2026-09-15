"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function approveStudent(studentId: string, groupId: string) {
  // Server Actions are public HTTP endpoints — "use server" does not
  // protect them. Anyone can craft a request, so every action re-checks.
  const session = await auth();
  if (session?.user.role !== "TEACHER") {
    throw new Error("Not authorised");
  }

  // One transaction: either both writes land or neither does. Otherwise a
  // failure between them leaves an ACTIVE student in no group — able to
  // log in, seeing nothing.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: studentId },
      data: { status: "ACTIVE" },
    }),
    prisma.enrollment.create({
      data: { studentId, groupId },
    }),
  ]);

  // Discards Next's cached render so the approved student drops off
  // the queue on the next paint.
  revalidatePath("/dashboard");
}