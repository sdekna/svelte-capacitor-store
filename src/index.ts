import { writable, type Writable } from "svelte/store";
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isDeviceNative = Capacitor.isNativePlatform();

export type ArrayStoreInputType<T> =
  {
    storeName: string,
    initialValue: T,
    initFunction?: () => void,
    validationStatement?: (value: T) => boolean
  }

export function arrayStore<T>({ storeName, initialValue, initFunction, validationStatement }: ArrayStoreInputType<T>) {

  let storeValueInitialized = false

  const { subscribe, update, set } = writable(initialValue, () => {
    if (typeof window === 'undefined') return
    setTimeout(async () => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (Array.isArray(storedValue)) {
        validationStatement ? customSet(storedValue) : set(storedValue)
      }
      storeValueInitialized = true
      if (initFunction) initFunction()
    }, 0);
  }) as Writable<T>;

  const customSet = (value: T): void => {
    if (typeof window === 'undefined' || !value || !Array.isArray(value) || !value.length || !value?.[0]) return
    if (validationStatement && !validationStatement(value)) return
    set(value);
  };

  function customSubscribe(callback: (value: T, lastValue: T) => void) {
    let lastStoreValue: T = initialValue;
    return subscribe((value: T) => {
      const lastValue = structuredClone(lastStoreValue);
      lastStoreValue = value;
      return callback(value, lastValue);
    });
  }

  customSubscribe(async (value: T, lastValue: T) => {
    if (typeof window === 'undefined' || !storeValueInitialized || !value || !Array.isArray(value) || !value.length || !value?.[0]) return
    if (validationStatement && !validationStatement(value)) { customSet(lastValue ?? initialValue); return }

    if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(value) })
    else localStorage.setItem(storeName, JSON.stringify(value));

  });

  return {
    subscribe: customSubscribe,
    update,
    set: validationStatement ? customSet : set,

    reset: async (): Promise<void> => {
      if (typeof window === 'undefined') return
      set(initialValue)
      if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(initialValue) })
      else localStorage.setItem(storeName, JSON.stringify(initialValue));
    },
    getValue: async (): Promise<T | null> => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (Array.isArray(storedValue)) {
        validationStatement ? customSet(storedValue) : set(storedValue)
        return storedValue
      }

      return null
    }

  }
}



export type ObjectStoreInputType<T> =
  {
    storeName: string, initialValue: T, initFunction?: () => void, validationStatement?: (value: T) => boolean
  }

export function objectStore<T>({ storeName, initialValue, initFunction, validationStatement }: ObjectStoreInputType<T>) {
  let storeValueInitialized = false

  const { subscribe, update, set } = writable(initialValue, () => {
    if (typeof window === 'undefined') return
    setTimeout(async () => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (storedValue) {
        validationStatement ? customSet(storedValue) : set(storedValue)
      }

      storeValueInitialized = true
      if (initFunction) initFunction()
    }, 0);
  }) as Writable<T>;

  const customSet = (value: T): void => {
    if (typeof window === 'undefined' || !value) return
    if (validationStatement && !validationStatement(value)) return
    set(value);
  };

  function customSubscribe(callback: (value: T, lastValue: T) => void) {
    let lastStoreValue: T = initialValue;
    return subscribe((value: T) => {
      const lastValue = structuredClone(lastStoreValue);
      lastStoreValue = value;
      return callback(value, lastValue);
    });
  }

  customSubscribe(async (value: T, lastValue) => {
    if (typeof window === 'undefined' || !storeValueInitialized || !value) return
    if (validationStatement && !validationStatement(value)) { customSet(lastValue ?? initialValue); return }

    if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(value) })
    else localStorage.setItem(storeName, JSON.stringify(value));

  });


  return {
    subscribe: customSubscribe,
    update,
    set: validationStatement ? customSet : set,

    reset: async (): Promise<void> => {
      if (typeof window === 'undefined') return
      set(initialValue)
      if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(initialValue) })
      else localStorage.setItem(storeName, JSON.stringify(initialValue));
    },

    getValue: async (): Promise<T | null> => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (storedValue) {
        validationStatement ? customSet(storedValue) : set(storedValue)
        return storedValue
      }

      return null
    }

  }
}



export type VariableStoreInputType<T> =
  { storeName: string, initialValue: T, initFunction?: () => void, validationStatement?: (value: T) => boolean }

export function variableStore<T>({ storeName, initialValue, initFunction, validationStatement }: VariableStoreInputType<T>) {
  let storeValueInitialized = false

  const { subscribe, update, set } = writable(initialValue, () => {
    if (typeof window === 'undefined') return
    setTimeout(async () => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (storedValue !== null && storedValue !== undefined && typeof storedValue === typeof initialValue) {
        validationStatement ? customSet(storedValue) : set(storedValue)
        return
      }

      storeValueInitialized = true
      if (initFunction) initFunction()
    }, 100);
  }) as Writable<T>;

  const customSet = (value: T): void => {
    if (typeof window === 'undefined' || (validationStatement && !validationStatement(value))) return
    set(value);
  };

  function customSubscribe(callback: (value: T, lastValue: T) => void) {
    let lastStoreValue: T = initialValue;
    return subscribe((value: T) => {
      const lastValue = structuredClone(lastStoreValue);
      lastStoreValue = value;
      return callback(value, lastValue);
    });
  }


  customSubscribe(async (value: T, lastValue: T) => {
    if (typeof window === 'undefined' || !storeValueInitialized) return
    if (validationStatement && !validationStatement(value)) { customSet(lastValue ?? initialValue); return }

    if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(value) })
    else localStorage.setItem(storeName, JSON.stringify(value));

  });

  return {
    subscribe: customSubscribe,
    update,
    set: validationStatement ? customSet : set,

    reset: async (): Promise<void> => {
      if (typeof window === 'undefined') return
      set(initialValue)
      if (isDeviceNative) await setCapacitorStore({ key: storeName, value: JSON.stringify(initialValue) })
      else localStorage.setItem(storeName, JSON.stringify(initialValue));
    },

    getValue: async (): Promise<T | null> => {
      let storedValue: T | null
      if (isDeviceNative) {
        storedValue = await getCapacitorStore(storeName) as T | null
      } else {
        storedValue = JSON.parse(localStorage.getItem(storeName) || 'null') as T | null
      }

      if (typeof storedValue === typeof initialValue && storedValue !== null) {
        validationStatement ? customSet(storedValue) : set(storedValue)
        return storedValue
      }

      return null
    }

  }
}

async function getCapacitorStore(key: string) {
  try {
    if (typeof window === 'undefined' || !isDeviceNative) return null

    const result = await Preferences.get({ key });
    const value = result.value;
    return value ? JSON.parse(value) : null;
  } catch (error) {
    // console.error(`Error at getStore function, key: ${key}.`, { error });
    return null
  }
}

async function setCapacitorStore({ key, value }: { key: string, value: any }) {
  try {
    if (typeof window === 'undefined' || !isDeviceNative) return
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch (error) {
    // console.error(`Error at setStore function, key: ${key}.`, { error });
  }
}
