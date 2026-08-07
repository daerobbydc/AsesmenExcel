"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="bg-excel-green text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <svg
                className="w-8 h-8 text-excel-green"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9.5,11V13H7.5V11H9.5M16.5,11V13H14.5V11H16.5M9.5,15V17H7.5V15H9.5M16.5,15V17H14.5V15H16.5Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Asesmen Excel</h1>
              <p className="text-xs text-green-200">Pelatihan Basic & Intermediate</p>
            </div>
          </Link>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="hover:text-green-200 transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-green-200 text-sm">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-green-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-excel-green hover:bg-green-50 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
