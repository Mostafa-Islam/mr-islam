"use client";

import { signOut } from "next-auth/react";

// Client Component because signOut runs in the browser — it clears the
// session cookie and then navigates.
export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-neutral-600 underline"
    >
      Log out
    </button>
  );
}