import React, { useSyncExternalStore } from "react";
import {
  notificationStore,
  NotificationItem,
  NotificationType,
} from "../../lib/notificationStore";
import {
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

const TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: React.FC<{ className?: string }>;
    badgeStyle: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    badgeStyle: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    iconColor: "text-emerald-400",
  },
  info: {
    icon: Sparkles,
    badgeStyle: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
    iconColor: "text-indigo-400",
  },
  warning: {
    icon: AlertTriangle,
    badgeStyle: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    iconColor: "text-amber-400",
  },
  error: {
    icon: AlertCircle,
    badgeStyle: "bg-rose-500/15 border-rose-500/30 text-rose-400",
    iconColor: "text-rose-400",
  },
  loading: {
    icon: Loader2,
    badgeStyle: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    iconColor: "text-amber-400 animate-spin",
  },
};

export const NotificationContainer: React.FC = () => {
  const notifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.getSnapshot
  );

  if (notifications.length === 0) return null;

  return (
    <aside
      aria-live="polite"
      aria-label="Notifikasi Sistem"
      className="fixed z-50 pointer-events-none transition-all duration-300
        /* Web / Desktop: Tampil di pojok kanan atas di bawah header */
        sm:top-20 sm:right-6 sm:bottom-auto sm:left-auto
        /* Mobile: Tampil di bagian bawah (di atas FAB preview) */
        bottom-20 left-4 right-4 sm:inset-x-auto
        flex flex-col gap-2.5 items-center sm:items-end"
    >
      {notifications.map((item: NotificationItem) => {
        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto w-full sm:w-auto sm:min-w-[320px] sm:max-w-md bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-4"
          >
            {/* Icon Badge */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${config.badgeStyle}`}
            >
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>

            {/* Notification Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-heading font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                  {item.title}
                </h5>
                {item.timeString && (
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-800/90 px-1.5 py-0.5 rounded-md border border-slate-700/60 font-medium">
                    {item.timeString}
                  </span>
                )}
              </div>

              {item.message && (
                <p className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug break-words">
                  {item.message}
                </p>
              )}
            </div>

            {/* Tombol Tutup Notifikasi */}
            <button
              type="button"
              onClick={() => notificationStore.dismiss(item.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors shrink-0 cursor-pointer -mr-1 -mt-0.5"
              aria-label="Tutup notifikasi"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};

