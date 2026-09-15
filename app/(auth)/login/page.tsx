import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SITE } from "@/constants/site";
import { LoginForm } from "./login-form";

// No "use client" — this is a Server Component by default in the App Router.
// It runs on the server only, so it can read the session and touch the
// database without shipping any of that code to the browser.
export default async function LoginPage() {
  const session = await auth();

  // Already logged in? Don't show a login form. Send them where they belong.
  if (session?.user) {
    redirect(session.user.role === "TEACHER" ? "/dashboard" : "/home");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-[#F7F4EF] px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-[#14201C]">
          {SITE.shortName}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sign in with the number you gave {SITE.shortName}.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}