import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { useSyncExternalStore } from "react";

let subscriptions: Subscription[] = [...HOME_SUBSCRIPTIONS];
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const subscriptionsStore = {
  get: (): Subscription[] => subscriptions,
  set: (newSubs: Subscription[]) => {
    subscriptions = newSubs;
    emitChange();
  },
  add: (newSub: Omit<Subscription, "status"> & { status?: Subscription["status"] }) => {
    const sub = { ...newSub, status: newSub.status || "active" } as Subscription;
    subscriptions = [sub, ...subscriptions];
    emitChange();
  },
  update: (id: string, updates: Partial<Subscription>) => {
    subscriptions = subscriptions.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    emitChange();
  },
  remove: (id: string) => {
    subscriptions = subscriptions.filter((s) => s.id !== id);
    emitChange();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSubscriptions() {
  const currentSubscriptions = useSyncExternalStore(
    subscriptionsStore.subscribe,
    subscriptionsStore.get,
    subscriptionsStore.get
  );

  return {
    subscriptions: currentSubscriptions,
    addSubscription: subscriptionsStore.add,
    updateSubscription: subscriptionsStore.update,
    removeSubscription: subscriptionsStore.remove,
    setSubscriptions: subscriptionsStore.set,
  };
}
