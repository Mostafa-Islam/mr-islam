"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type SignupState } from "./actions";
import { GRADE_LABELS } from "@/constants/grades";

const initialState: SignupState = {};

export function SignupForm() {
  // useActionState wires a server action to a form and gives you back
  // its return value plus a pending flag — no useState, no fetch, no
  // manual loading handling. The browser posts straight to the action.
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-[#0D6B5B]/30 bg-white p-5">
        <h2 className="font-medium text-[#0D6B5B]">Request sent</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Mr Islam will add you to your class. You can log in once he does.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm text-[#0D6B5B] underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Full name" name="name" required />
      <Field
        label="Phone number"
        name="phone"
        type="tel"
        inputMode="tel"
        placeholder="01224457318"
        required
      />
      <Field label="Email (optional)" name="email" type="email" />
      <Field
        label="Parent's phone (optional)"
        name="parentPhone"
        type="tel"
        inputMode="tel"
      />

      <div>
        <label className="block text-sm text-neutral-700 mb-1">Grade</label>
        <select
          name="grade"
          required
          defaultValue=""
          className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base bg-white"
        >
          <option value="" disabled>
            Choose your grade
          </option>
          {/* Object.entries turns the labels map into [value, label] pairs,
              so adding a grade to constants/grades.ts adds it here too. */}
          {Object.entries(GRADE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        required
      />

      {state.error && <p className="text-sm text-[#C0492B]">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[#0D6B5B] py-3 text-white font-medium disabled:opacity-50"
      >
        {pending ? "Sending…" : "Request to join"}
      </button>

      <p className="text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0D6B5B] underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

// Seven near-identical inputs would be seven copies of the same markup.
// One small component means a styling change happens in one place.
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm text-neutral-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base"
      />
    </div>
  );
}