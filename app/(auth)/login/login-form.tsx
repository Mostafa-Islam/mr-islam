"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

// "use client" marks this as a Client Component — it ships to the browser
// and can use state and event handlers. The page above can't do either.
// Keeping it in its own file means only THIS file goes to the browser,
// not the session logic or the SITE constants lookup.
export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();      // stop the browser's default full-page reload
    setError("");
    setLoading(true);

    // redirect: false keeps us on the page so we can show an error inline
    // instead of Auth.js bouncing to its own error URL.
    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Deliberately vague — same reason authorize() returns a bare null.
      setError("Wrong number or password.");
      return;
    }

    // refresh() re-runs the server component, which re-reads the session
    // and redirects to the right place based on role.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-neutral-700 mb-1">
          Phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          // inputMode makes Android show the number pad, not the full keyboard
          inputMode="tel"
          autoComplete="tel"
          className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base"
          placeholder="+20 106 482 1173"
        />
      </div>

      <div>
        <label className="block text-sm text-neutral-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
      </div>

      {error && <p className="text-sm text-[#C0492B]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#0D6B5B] py-3 text-white font-medium disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}