export type NotificationType = "success" | "info" | "warning" | "error" | "loading";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timeString: string;
  duration?: number;
}

type Listener = () => void;
let notifications: NotificationItem[] = [];
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const notificationStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): NotificationItem[] {
    return notifications;
  },
  dismiss(id: string) {
    notifications = notifications.filter((n) => n.id !== id);
    emitChange();
  },
  add(item: Omit<NotificationItem, "id" | "timeString"> & { id?: string }): string {
    const id = item.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, "0")}.${String(now.getMinutes()).padStart(2, "0")}`;

    const newNotif: NotificationItem = {
      id,
      type: item.type,
      title: item.title,
      message: item.message,
      timeString,
      duration: item.duration ?? (item.type === "loading" ? 0 : 3500),
    };

    // Jika ID sudah ada, timpa (berguna untuk update notifikasi loading -> success)
    const exists = notifications.some((n) => n.id === id);
    if (exists) {
      notifications = notifications.map((n) => (n.id === id ? newNotif : n));
    } else {
      // Batasi maksimal 3 notifikasi aktif sekaligus agar tidak menutupi layar
      notifications = [newNotif, ...notifications.slice(0, 2)];
    }
    emitChange();

    // Auto-dismiss jika ada durasi
    if (newNotif.duration && newNotif.duration > 0) {
      setTimeout(() => {
        notificationStore.dismiss(id);
      }, newNotif.duration);
    }

    return id;
  },
  clear() {
    notifications = [];
    emitChange();
  },
};

/**
 * Helper notify serbaguna yang dapat dipanggil dari mana saja (komponen, hook, async action).
 */
export const notify = {
  // Panggilan simpel: notify.show("Tersimpan di Cloud (17.18)")
  show: (title: string, message?: string) =>
    notificationStore.add({ type: "info", title, message }),

  success: (title: string, message?: string, duration?: number) =>
    notificationStore.add({ type: "success", title, message, duration }),

  info: (title: string, message?: string, duration?: number) =>
    notificationStore.add({ type: "info", title, message, duration }),

  warning: (title: string, message?: string, duration?: number) =>
    notificationStore.add({ type: "warning", title, message, duration: duration ?? 4500 }),

  error: (title: string, message?: string, duration?: number) =>
    notificationStore.add({ type: "error", title, message, duration: duration ?? 5000 }),

  loading: (title: string, message?: string, customId?: string) =>
    notificationStore.add({ type: "loading", title, message, duration: 0, id: customId }),

  dismiss: (id: string) => notificationStore.dismiss(id),
};

