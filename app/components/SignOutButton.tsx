"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-600"
    >
      Sign out
    </button>
  );
}
