"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Sparkles, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/", label: "directory" },
  { href: "/pulse", label: "pulse" },
  { href: "/meetups", label: "meetups" },
  { href: "/submit", label: "submit" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#050507]/90 backdrop-blur-xl border-white/5 py-3"
          : "bg-transparent border-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-black tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              AS
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:opacity-80 transition-opacity uppercase">
              AiStack<span className="text-blue-500">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-white transition-colors pb-1 border-b-2 ${
                  isActive(item.href)
                    ? "text-white border-blue-500"
                    : "border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors"
              size={14}
            />
            <Input
              type="text"
              placeholder="Quick search..."
              className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 w-48 transition-all focus:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
          {!loading && user ? (
            <Button asChild className="hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-[10px] font-black tracking-tighter hover:bg-slate-200 transition-colors">
              <Link href="/my-stack">
                <User size={14} className="mr-1" />
                My AI Stack
              </Link>
            </Button>
          ) : (
            <Button asChild className="hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-[10px] font-black tracking-tighter hover:bg-slate-200 transition-colors">
              <Link href="/auth/login">Join Community</Link>
            </Button>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0a0c] border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-bold uppercase tracking-widest ${
                isActive(item.href) ? "text-blue-500" : "text-white/40"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {!loading && user && (
            <Link
              href="/my-stack"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-blue-500"
            >
              My AI Stack
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export function NavbarBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6">
      <Sparkles size={12} /> The 2026 Intelligence Directory
    </div>
  );
}