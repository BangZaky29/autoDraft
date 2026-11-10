import React, { useState, useRef, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, LogOut, ChevronDown, Scale } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface UserProfileDropdownProps {
  onOpenProfile: () => void;
  onLogout: () => void;
  notaryName?: string;
  notaryWilayah?: string;
  kuasaName?: string;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  onOpenProfile,
  onLogout,
  notaryName,
  notaryWilayah,
  kuasaName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Ambil sesi user saat mount & dengarkan perubahan auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);


  // Ekstraksi data profil Google
  const googleMetadata = user?.user_metadata || {};
  const avatarUrl = googleMetadata.avatar_url || googleMetadata.picture || "";
  const googleName = googleMetadata.full_name || googleMetadata.name || "";

  // Nama Tampilan Ringkas (Header)
  const displayName = googleName || (kuasaName ? kuasaName.split(",")[0].trim() : "Vikri Firdaus");

  // Nama Lengkap dengan Gelar (Dropdown)
  const fullDisplayName = kuasaName || googleName || "Vikri Firdaus, S.H.";

  // Role / Jabatan
  const roleTitle = "Staf Notaris";
  const roleBadge = "Staf Pembuat Akta";

  // Email
  const userEmail = user?.email || "vikri.firdaus@notariat.id";

  // Afiliasi Notaris
  const cleanNotaryName = notaryName
    ? notaryName.replace(/^notaris\s+/i, "")
    : "Jihan Khoirini, S.H., M.Kn.";
  const affiliationTitle = cleanNotaryName.toLowerCase().startsWith("kantor")
    ? cleanNotaryName
    : `Kantor Notaris ${cleanNotaryName}`;

  const affiliationLocation = notaryWilayah
    ? `${notaryWilayah} / Jawa Barat`
    : "Kabupaten Bandung Barat / Jawa Barat";

  // Inisial untuk Fallback Avatar jika Google Photo belum termuat
  const initials =
    displayName
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "VF";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button: Google Profile Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center gap-2 sm:gap-2.5 py-1 pl-1.5 pr-2.5 sm:pr-3 rounded-2xl border transition-all cursor-pointer shadow-xs focus:outline-hidden ${isOpen
          ? "bg-slate-700/90 border-indigo-500/60 ring-2 ring-indigo-500/20 text-white"
          : "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 hover:border-slate-600 text-slate-200"
          }`}
        title="Menu Profil Pengguna & Afiliasi Notariat"
      >
        {/* Avatar Squircle dengan Online Indicator */}
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl shrink-0 overflow-visible">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={displayName}
              onError={() => setImgError(true)}
              className="w-full h-full rounded-xl object-cover ring-1 ring-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-extrabold text-[11px] sm:text-xs shadow-xs">
              {initials}
            </div>
          )}
          {/* Status Dot Aktif */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B1120]" />
        </div>

        {/* User Info (Nama & Role) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-100 group-hover:text-white leading-tight truncate max-w-[110px] md:max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-400 font-medium leading-tight truncate max-w-[110px]">
            {roleTitle}
          </span>
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-400" : ""
            }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-84 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* 1. Header Profil Pengguna */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-12 h-12 rounded-2xl shrink-0">
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full rounded-2xl object-cover ring-1 ring-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-black text-sm flex items-center justify-center shadow-md">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-500/20" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-sm text-slate-900 leading-tight truncate">
                {fullDisplayName}
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {roleBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate mt-1">
                {userEmail}
              </p>
            </div>
          </div>

          {/* 2. Afiliasi Notariat Card */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 my-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                <Scale className="w-3 h-3 text-indigo-600" />
                AFILIASI NOTARIAT
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/50">
                SK Aktif
              </span>
            </div>
            <div className="font-heading font-bold text-xs text-slate-800 leading-snug truncate">
              {affiliationTitle}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
              {affiliationLocation}
            </div>
          </div>

          {/* 3. Menu List */}
          <div className="space-y-1">

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Keluar / Ganti Akun</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
