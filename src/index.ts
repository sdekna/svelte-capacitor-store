import { writable, type Writable } from "svelte/store";
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isDeviceNative = Capacitor.isNativePlatform();

export function arrayStore<T>({ storeName, initialValue, initFunction }: { storeName: string, initialValue: T, initFunction?: () => void }) {

  const { subscribe, update, set } = writable(initialValue, () => {
    if (typeof window === 'undefined') return
    setTimeout(async () => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (Array.isArray(storedValue)) set(storedValue);
      if (initFunction) initFunction()
    }, 0);
  }) as Writable<T>;

  subscribe(async (value: T) => {
    if (typeof window === 'undefined' || !value || !Array.isArray(value) || !value.length || !value?.[0]) return
    if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(value) })
    else localStorage.setItem(storeName, JSON.stringify(value));
  });

  return {
    subscribe,
    update,
    set,

    reset: async (): Promise<void> => {
      if (typeof window === 'undefined') return
      set(initialValue)
      if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(initialValue) })
      else localStorage.setItem(storeName, JSON.stringify(initialValue));
    },

  }
}

export function objectStore<T>({ storeName, initialValue, initFunction }: { storeName: string, initialValue: T, initFunction?: () => void }) {

  const { subscribe, update, set } = writable(initialValue, () => {
    if (typeof window === 'undefined') return
    setTimeout(async () => {
      if (initFunction) return initFunction()
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (storedValue) {
        set(storedValue);
      }
    }, 0);
  }) as Writable<T>;

  subscribe(async (value: T) => {
    if (typeof window === 'undefined' || !value) return
    if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(value) })
    else localStorage.setItem(storeName, JSON.stringify(value));
  });

  return {
    subscribe,
    update,
    set,

    reset: async (): Promise<void> => {
      if (typeof window === 'undefined') return
      set(initialValue)
      if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(initialValue) })
      else localStorage.setItem(storeName, JSON.stringify(initialValue));
    },

  }
}

export function variableStore<T>({ storeName, initialValue, initFunction }: { storeName: string, initialValue: T, initFunction?: () => void }) {

  const { subscribe, update, set } = writable(initialValue, () => {
    if (typeof window === 'undefined') return
    setTimeout(async () => {
      if (initFunction) return initFunction()
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || '[]') as T | null
      }

      if (storedValue !== null && storedValue !== undefined && typeof storedValue === typeof initialValue) {
        set(storedValue);
        return storedValue
      }
    }, 0);
  }) as Writable<T>;

  subscribe(async (value: T) => {
    if (typeof window === 'undefined' || typeof value !== typeof initialValue) return
    if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(value) })
    else localStorage.setItem(storeName, JSON.stringify(value));
  });

  return {
    subscribe,
    update,
    set,

    reset: async (): Promise<void> => {
      if (typeof window === 'undefined') return
      set(initialValue)
      if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(initialValue) })
      else localStorage.setItem(storeName, JSON.stringify(initialValue));
    },

  }
}

async function getCapacitorStore(key: string) {
  try {
    if (typeof window === 'undefined' || !isDeviceNative) return null

    const result = await Preferences.get({ key });
    const value = result.value;
    return value ? JSON.parse(value) : null;
  } catch (error) {
    // console.error(`Error at getStore function, key: ${key}. error: ${error}`);
    return null
  }
}

async function setCapacitorStore({ key, value }: { key: string, value: any }) {
  try {
    if (typeof window === 'undefined' || !isDeviceNative) return
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch (error) {
    // console.error(`Error at setStore function, key: ${key}. error: ${error}`);
  }
}
