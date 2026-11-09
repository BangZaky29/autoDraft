import React, { useEffect, useState } from "react";
import { supabase, signInWithGoogle } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Shield, Sparkles, Scale, CheckCircle2, Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs tracking-widest text-slate-400 text-center uppercase">
          Memverifikasi Sesi Notariat RI & AHU Online...
        </p>
      </div>
    );
  }

  // Jika belum login, render Bento Login Screen
  if (!session) {
    return (
      <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Card */}
          <div className="pt-10 pb-8 px-8 sm:px-12 text-center bg-gradient-to-b from-slate-50 to-white">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-lg mb-5 transform hover:scale-105 transition-transform">
              <Scale className="w-8 h-8" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">AutoMinuta</h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold tracking-wider">
                NOTARIAT RI
              </span>
            </div>
            
            <h2 className="text-base font-heading font-bold text-slate-800">Masuk ke Ruang Kerja Notariat</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Portal Otomasi Minuta Akta Otentik, Komparisi Pejabat & Sinkronisasi Ditjen AHU Kemenkumham RI
            </p>
          </div>

          {/* Action Login */}
          <div className="px-8 sm:px-12 pb-10 pt-2 flex flex-col items-center">
            <button
              onClick={() => signInWithGoogle()}
              type="button"
              className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm hover:shadow-md flex items-center justify-center gap-3.5 transition-all duration-200 active:scale-[0.99] cursor-pointer group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span className="font-heading text-sm text-slate-800 font-bold group-hover:text-indigo-600 transition-colors">
                Masuk dengan Akun Google
              </span>
            </button>

            <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 w-full flex items-center justify-center gap-2 text-center">
              <Lock className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-[11px] text-slate-600 leading-snug">
                Dilindungi enkripsi Google OAuth 2.0 & Keamanan Sertifikat Elektronik AHU RI
              </span>
            </div>
          </div>

          {/* Footer Card */}
          <div className="py-3 px-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kepatuhan UUJN & Ditjen AHU</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-emerald-700 font-bold">● SSL 256-BIT</span>
              <span>•</span>
              <span>v2.6.4</span>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
};

