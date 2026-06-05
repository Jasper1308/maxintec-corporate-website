"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerNavigation } from "@/data/headerContent";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { logo, navItems, solutions, buttons } = headerNavigation;
  const isSectionActive = (href: string) => pathname?.startsWith(href);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="w-full bg-blue-950/95 backdrop-blur-md text-white sticky top-0 z-50 border-b border-blue-800/60 shadow-sm shadow-blue-950/30">
      <div className={`container mx-auto px-4 ${isScrolled ? "py-2" : "py-3"} md:px-6 ${isScrolled ? "md:py-3" : "md:py-4"} flex items-center justify-between gap-4 md:gap-5 transition-all duration-300 ease-out`}>
        
        {/* Logo */}
        <Link href="/institutional" className="flex items-center text-white min-w-0">
          <img
            src={logo}
            alt="Maxintec"
            className={`w-auto object-contain transition-all duration-300 ${isScrolled ? "h-7 md:h-9 xl:h-11" : "h-8 md:h-10 xl:h-12"}`}
          />
        </Link>

        {/* Main Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 text-sm md:gap-6 md:text-base font-medium text-slate-100">
          {navItems.map((item) => {
            const active = isSectionActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-xl transition-all duration-200 ${active ? "border border-white/90 bg-slate-900/90 text-white" : "text-slate-100 hover:text-white hover:bg-slate-800/40"}`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* Solutions Dropdown Menu */}
          <div className="relative group">
            <button className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${isSectionActive("/solutions") ? "border border-white/90 bg-slate-900/90 text-white" : "text-slate-100 hover:text-white hover:bg-slate-800/40"}`}>
              {solutions.label}
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 w-64 bg-slate-900 border border-slate-800 rounded-lg p-2 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 mt-1">
              <div className="text-xs font-semibold text-slate-500 px-3 py-2 uppercase tracking-wider">Serviços</div>
              {solutions.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Action Buttons Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href={buttons.clientArea.href}
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            {buttons.clientArea.label}
          </Link>
          
          <Link 
            href={buttons.requestProject.href}
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20"
          >
            {buttons.requestProject.label}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-950 border-b border-blue-900/70 px-4 py-4 flex flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-xl transition-colors ${isSectionActive(item.href) ? "bg-slate-900/90 border border-white/90 text-white" : "bg-slate-900 text-slate-100 hover:bg-slate-800"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={buttons.clientArea.href}
            className="block px-4 py-3 rounded-xl bg-slate-800 text-blue-200 font-semibold hover:bg-slate-700 transition-colors"
          >
            {buttons.clientArea.label}
          </Link>
          <Link
            href={buttons.requestProject.href}
            className="block px-4 py-3 rounded-xl bg-blue-600 text-white text-center font-semibold hover:bg-blue-500 transition-colors"
          >
            {buttons.requestProject.label}
          </Link>
        </div>
      )}
    </header>
  );
}
