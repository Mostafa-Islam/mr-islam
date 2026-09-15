import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SITE } from "@/constants/site";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "TEACHER" ? "/dashboard" : "/home");
  }

  return (
    <main className="min-h-dvh bg-[#F7F4EF] px-6 py-10">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[#14201C]">
          Join {SITE.shortName}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Fill this in and {SITE.shortName} will add you to your class.
        </p>

        <div className="mt-8">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}