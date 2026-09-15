"use client";

import { useState, useTransition } from "react";
import { approveStudent } from "./actions";
import { GRADE_LABELS } from "@/constants/grades";
import type { Grade } from "@/lib/generated/prisma/client";

type Student = {
  id: string;
  name: string;
  phone: string;
  grade: Grade | null;
};

type Group = { id: string; name: string };

export function PendingStudents({
  students,
  groups,
}: {
  students: Student[];
  groups: Group[];
}) {
  // Which group is selected for each student, keyed by student id.
  // One shared object rather than state inside each row, so the parent
  // stays in control of what gets submitted.
  const [selected, setSelected] = useState<Record<string, string>>({});

  // useTransition keeps the UI responsive while the server action runs
  // and gives you isPending without managing a loading boolean yourself.
  const [isPending, startTransition] = useTransition();

  if (students.length === 0) {
    return (
      <p className="text-sm text-neutral-600">No students waiting.</p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
      {students.map((s) => (
        <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[#14201C]">{s.name}</p>
            <p className="text-sm text-neutral-600">
              {s.phone}
              {s.grade && ` · ${GRADE_LABELS[s.grade]}`}
            </p>
          </div>

          <select
            value={selected[s.id] ?? ""}
            onChange={(e) =>
              setSelected((prev) => ({ ...prev, [s.id]: e.target.value }))
            }
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Choose group
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <button
            // Disabled until a group is picked — approving into no group
            // would make an ACTIVE student who can see nothing.
            disabled={!selected[s.id] || isPending}
            onClick={() =>
              startTransition(() => approveStudent(s.id, selected[s.id]))
            }
            className="rounded-lg bg-[#0D6B5B] px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Approve
          </button>
        </li>
      ))}
    </ul>
  );
}