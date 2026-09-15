"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

// "use server" marks every export here as a Server Action — a function the
// browser can call but whose code never leaves the server. It replaces
// writing a POST route by hand.

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  parentPhone: z.string().optional().or(z.literal("")),
  grade: z.enum(["MIDDLE_1","MIDDLE_2","MIDDLE_3","IG_9","IG_10","IG_11","IG_12"]),
  password: z.string().min(8, "At least 8 characters"),
});

export type SignupState = { error?: string; success?: boolean };

export async function signup(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    parentPhone: formData.get("parentPhone"),
    grade: formData.get("grade"),
    password: formData.get("password"),
  });

  // Validating here rather than only in the browser. HTML `required`
  // attributes are a convenience for the user — anyone can bypass them
  // by posting directly. The server is the only place a check counts.
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const phone = normalizePhone(parsed.data.phone);

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return { error: "This number is already registered." };
  }

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      phone,
      email: parsed.data.email || null,
      parentPhone: parsed.data.parentPhone
        ? normalizePhone(parsed.data.parentPhone)
        : null,
      grade: parsed.data.grade,
      password: await bcrypt.hash(parsed.data.password, 10),
      // role and status come from schema defaults: STUDENT, PENDING.
      // Never accept either from the form — a crafted POST could
      // otherwise create a TEACHER account.
    },
  });

  return { success: true };
}
