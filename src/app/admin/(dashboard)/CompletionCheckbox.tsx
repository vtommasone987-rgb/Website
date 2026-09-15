"use client";

import { useTransition } from "react";

export function CompletionCheckbox({
  id,
  defaultChecked,
  action,
}: {
  id: string;
  defaultChecked: boolean;
  action: (id: string, completed: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={defaultChecked}
      disabled={isPending}
      onChange={(e) => {
        const completed = e.target.checked;
        startTransition(() => {
          action(id, completed);
        });
      }}
      className="h-4 w-4 rounded border-neutral-400 accent-brand-600"
    />
  );
}
