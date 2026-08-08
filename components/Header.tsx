"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";
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

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isSolid = !isLanding || scrolled;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isSolid 
        ? "bg-white/90 backdrop-blur-xl shadow-glass border-b border-gray-100" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 ${
              isSolid 
                ? "bg-excel-green text-white shadow-md" 
                : "bg-white/90 text-excel-green shadow-glass"
            }`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9.5,11V13H7.5V11H9.5M16.5,11V13H14.5V11H16.5M9.5,15V17H7.5V15H9.5M16.5,15V17H14.5V15H16.5Z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-lg font-bold transition-colors duration-300 ${
                isSolid ? "text-gray-900" : "text-white"
              }`}>
                Asesmen Excel
              </h1>
              <p className={`text-xs hidden sm:block transition-colors duration-300 ${
                isSolid ? "text-gray-400" : "text-white/70"
              }`}>
                Pelatihan Basic & Intermediate
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isSolid 
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}>
                  Dashboard
                </Link>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isSolid ? "bg-gray-100 text-gray-500" : "bg-white/10 text-white/60"
                }`}>
                  {user.email}
                </span>
                <button 
                  onClick={handleLogout} 
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isSolid 
                      ? "text-gray-600 hover:text-red-600 hover:bg-red-50" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isSolid 
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}>
                  Login
                </Link>
                <Link href="/register" className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isSolid 
                    ? "bg-excel-green text-white hover:bg-excel-darkgreen shadow-md hover:shadow-card-hover" 
                    : "bg-white text-excel-green hover:bg-white/90 shadow-glass"
                }`}>
                  Daftar
                </Link>
              </>
            )}
          </nav>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className={`md:hidden p-2 rounded-xl transition-all duration-200 ${
              isSolid 
                ? "text-gray-600 hover:bg-gray-100" 
                : "text-white hover:bg-white/10"
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-slide-down">
            <div className={`p-4 rounded-2xl ${
              isSolid ? "bg-white shadow-modern border border-gray-100" : "glass"
            }`}>
              {user ? (
                <div className="space-y-2">
                  <Link href="/dashboard" className={`block px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isSolid ? "text-gray-700 hover:bg-gray-50" : "text-white hover:bg-white/10"
                  }`} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <p className={`px-4 text-xs ${isSolid ? "text-gray-400" : "text-white/50"}`}>
                    {user.email}
                  </p>
                  <button 
                    onClick={handleLogout} 
                    className={`block w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors ${
                      isSolid ? "text-red-600 hover:bg-red-50" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className={`block px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isSolid ? "text-gray-700 hover:bg-gray-50" : "text-white hover:bg-white/10"
                  }`} onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/register" className={`block px-4 py-2.5 rounded-xl font-semibold text-center transition-colors ${
                    isSolid ? "bg-excel-green text-white" : "bg-white text-excel-green"
                  }`} onClick={() => setMenuOpen(false)}>
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
