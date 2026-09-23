"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p className="p-6">Loading...</p>;
  if (!session) {
    return (
      <div className="p-6">
        <p>You're not logged in.</p>
        <Link href="/api/auth/signin" className="underline">
          Log in with GitHub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        {session.user?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="avatar" className="w-16 h-16 rounded-full" />
        )}
        <div>
          <p className="font-semibold text-lg">{session.user?.name}</p>
          <p className="text-sm text-gray-500">{session.user?.email}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard" className="border rounded px-4 py-2 text-sm">
          Manage API Keys
        </Link>
        <Link href="/playground" className="border rounded px-4 py-2 text-sm">
          Playground
        </Link>
        <button
          className="bg-black text-white rounded px-4 py-2 text-sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
