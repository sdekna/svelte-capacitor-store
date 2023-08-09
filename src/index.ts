import { writable, type Writable } from "svelte/store";
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isDeviceNative = Capacitor.isNativePlatform();

export type ArrayStoreInputType<T> = {
  storeName: string,
  initialValue: T,
  initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>,
  validationStatement?: (value: NonNullable<T>) => boolean,
  persist?: boolean,
  noDuplication?: boolean,
}

export function arrayStore<T>({ storeName, persist, initialValue, noDuplication, initFunction, validationStatement }: ArrayStoreInputType<T>) {

  let currentValue: T = initialValue
  let previousValue: T = initialValue;

  const subscribers = new Set<(value: T, previousValue: T) => void>();

  const { set } = writable(initialValue) as Writable<T>;

  async function getValue(): Promise<{ value: T, previousValue: T | null } | { value: null, previousValue: null }> {
    try {
      if (typeof window === 'undefined') return { value: null, previousValue: null }

      let storedValue: T | null
      let storedPreviousValue: T | null

      if (!persist) {
        storedValue = currentValue
        storedPreviousValue = previousValue
      }
      else if (isDeviceNative) {
        const { value, previousValue } = await getCapacitorStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value
      } else {
        const { value, previousValue } = getLocalStorageStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value
      }

      if (Array.isArray(storedValue)) return { value: storedValue, previousValue: storedPreviousValue }
      else return { value: null, previousValue: null }

    } catch (error) {
      // console.error(`Error at getValue function, store: ${storeName}.`, { error });
      return { value: null, previousValue: null }
    }

  }

  const customSet = (value: T, storedPreviousValue?: T | null, initialization?: boolean): void => {
    if (typeof window === 'undefined' || !Array.isArray(value) || !value.length) return
    if (noDuplication && !initialization && areArraysEqual(value, currentValue)) return
    if (validationStatement && !validationStatement(value)) return

    set(value);

    previousValue = storedPreviousValue ?? currentValue;
    currentValue = value;
    if (persist) persistStore(storeName, value, previousValue)

    subscribers.forEach((callback) => {
      callback(value, previousValue);
    });
  };

  async function initializeStore() {
    const { value, previousValue } = await getValue()
    if (Array.isArray(value)) customSet(value, previousValue, true)
    else customSet(initialValue, null, true)
    if (initFunction) {
      try {
        await initFunction(value, previousValue, customSet, reset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  initializeStore()

  const customSubscribe = (callback: (value: T, previousValue: T) => void) => {
    if (typeof window === 'undefined') return () => { }
    subscribers.add(callback);
    callback(currentValue, previousValue);

    return () => {
      subscribers.delete(callback);
    };
  };

  const customUpdate = (callback: (value: T, previousValue: T) => T): void => {
    if (typeof window === 'undefined') return
    const newValue = callback(currentValue, previousValue);
    if (Array.isArray(newValue)) customSet(newValue)
  };


  function reset() {
    if (typeof window === 'undefined') return
    set(initialValue)

    previousValue = currentValue;
    currentValue = initialValue;

    if (persist) persistStore(storeName, initialValue, previousValue)
    subscribers.forEach((callback) => {
      callback(initialValue, previousValue);
    });
  }

  return {
    reset,
    getValue,
    set: customSet,
    update: customUpdate,
    init: initializeStore,
    subscribe: customSubscribe,

  }
}



export type ObjectStoreInputType<T> = {
  storeName: string,
  initialValue: T,
  persist?: boolean
  noDuplication?: boolean,
  validationStatement?: (value: NonNullable<T>) => boolean,
  initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>,
}

export function objectStore<T>({ storeName, initialValue, initFunction, validationStatement, persist, noDuplication }: ObjectStoreInputType<T>) {

  let currentValue: T = initialValue
  let previousValue: T = initialValue;

  const subscribers = new Set<(value: T, previousValue: T) => void>();

  const { set } = writable(initialValue) as Writable<T>;

  async function getValue(): Promise<{ value: T, previousValue: T | null } | { value: null, previousValue: null }> {
    try {
      if (typeof window === 'undefined') return { value: null, previousValue: null }

      let storedValue: T | null
      let storedPreviousValue: T | null
      if (!persist) {
        storedValue = currentValue
        storedPreviousValue = previousValue
      }
      else if (isDeviceNative) {
        const { value, previousValue } = await getCapacitorStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value

      } else {
        const { value, previousValue } = getLocalStorageStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value
      }

      if (storedValue) return { value: storedValue, previousValue: storedPreviousValue }

      return { value: null, previousValue: null }

    } catch (error) {
      // console.error(`Error at getValue function, store: ${storeName}.`, { error });
      return { value: null, previousValue: null }
    }

  }

  const customSet = (value: T, storedPreviousValue?: T | null, initialization?: boolean): void => {
    if (typeof window === 'undefined' || !value) return
    if (noDuplication && !initialization && areObjectsEqual(value, currentValue)) return
    if (validationStatement && !validationStatement(value)) return
    set(value);

    previousValue = storedPreviousValue ?? currentValue;
    currentValue = value;
    if (persist) persistStore(storeName, value, previousValue)

    subscribers.forEach((callback) => {
      callback(currentValue, previousValue);
    });
  };

  async function initializeStore() {
    const { value, previousValue } = await getValue()
    if (value) customSet(value, previousValue, true)
    else customSet(initialValue, null, true)
    if (initFunction) {
      try {
        await initFunction(value, previousValue, customSet, reset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  initializeStore()

  const customSubscribe = (callback: (value: T, previousValue: T) => void) => {
    if (typeof window === 'undefined') return () => { }
    subscribers.add(callback);
    callback(currentValue, previousValue);

    return () => {
      subscribers.delete(callback);
    };
  };

  const customUpdate = (callback: (value: T, previousValue: T) => T): void => {
    if (typeof window === 'undefined') return
    const newValue = callback(currentValue, previousValue);
    if (newValue) customSet(newValue)
  };


  function reset() {
    if (typeof window === 'undefined') return
    set(initialValue)

    previousValue = currentValue;
    currentValue = initialValue;

    if (persist) persistStore(storeName, initialValue, previousValue)
    subscribers.forEach((callback) => {
      callback(initialValue, previousValue);
    });
  }


  return {
    subscribe: customSubscribe,
    init: initializeStore,
    update: customUpdate,
    set: customSet,
    getValue,
    reset,

  }
}


export type VariableStoreInputType<T> = {
  storeName: string,
  initialValue: T,
  validationStatement?: (value: NonNullable<T>) => boolean,
  persist?: boolean,
  initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>,
  noDuplication?: boolean,
}

export function variableStore<T>({ storeName, initialValue, initFunction, validationStatement, persist, noDuplication }: VariableStoreInputType<T>) {

  let currentValue: T = initialValue
  let previousValue = initialValue;

  const subscribers = new Set<(value: T, previousValue: T) => void>();

  const { set } = writable(initialValue) as Writable<T>;


  async function getValue(): Promise<{ value: T, previousValue: T | null } | { value: null, previousValue: null }> {
    try {
      if (typeof window === 'undefined') return { value: null, previousValue: null }

      let storedValue: T | null
      let storedPreviousValue: T | null
      if (!persist) {
        storedValue = currentValue
        storedPreviousValue = previousValue
      }
      else if (isDeviceNative) {
        const { value, previousValue } = await getCapacitorStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value

      } else {
        const { value, previousValue } = getLocalStorageStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value
      }

      if (storedValue !== null && storedValue !== undefined) return { value: storedValue, previousValue: storedPreviousValue }

      return { value: null, previousValue: null }

    } catch (error) {
      // console.error(`Error at getValue function, store: ${storeName}.`, { error });
      return { value: null, previousValue: null }
    }
  }

  const customSet = (value: T, storedPreviousValue?: T | null, initialization?: boolean): void => {
    if (typeof window === 'undefined' || value === null || value === undefined) return
    if (noDuplication && !initialization && value === currentValue) return
    if (validationStatement && !validationStatement(value)) return

    set(value);

    previousValue = storedPreviousValue ?? currentValue;
    currentValue = value;
    if (persist) persistStore(storeName, value, previousValue)

    subscribers.forEach((callback) => {
      callback(value, previousValue);
    });
  };

  async function initializeStore() {
    const { value, previousValue } = await getValue()
    if (value !== null) customSet(value, previousValue, true)
    else customSet(initialValue, null, true)
    if (initFunction) {
      try {
        await initFunction(value, previousValue, customSet, reset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  initializeStore()

  const customSubscribe = (callback: (value: T, previousValue: T) => void) => {
    if (typeof window === 'undefined') return () => { }
    subscribers.add(callback);
    callback(currentValue, previousValue);

    return () => {
      subscribers.delete(callback);
    };
  };

  const customUpdate = (callback: (value: T, previousValue: T) => T): void => {
    const newValue = callback(currentValue, previousValue);
    customSet(newValue)
  };


  function reset() {
    if (typeof window === 'undefined') return
    set(initialValue)

    previousValue = currentValue;
    currentValue = initialValue;

    if (persist) persistStore(storeName, initialValue, previousValue)
    subscribers.forEach((callback) => {
      callback(initialValue, previousValue);
    });
  }

  return {
    subscribe: customSubscribe,
    init: initializeStore,
    update: customUpdate,
    set: customSet,
    getValue,
    reset,
  }
}


async function persistStore<T>(key: string, value: T, previousValue: T) {
  if (isDeviceNative) await setCapacitorStore<T>({ key, value, previousValue })
  else setLocalStorageStore<T>({ key, value, previousValue })
}


function getLocalStorageStore<T>(key: string): { value: T, previousValue: T } | { value: null, previousValue: null } {
  try {
    if (typeof window === 'undefined') return { value: null, previousValue: null }
    const stringValue = localStorage.getItem(key)
    if (!stringValue) return { value: null, previousValue: null }

    const { value, previousValue } = JSON.parse(stringValue) as { value: T, previousValue: T }

    return { value, previousValue };
  } catch (error) {
    // console.error(`Error at getLocalStorageStore function, key: ${key}.`, { error });
    return { value: null, previousValue: null }
  }
}

function setLocalStorageStore<T>({ key, value, previousValue }: { key: string, value: T, previousValue: T }) {
  try {
    if (typeof window === 'undefined') return
    const persistedValue = { value, previousValue }
    localStorage.setItem(key, JSON.stringify(persistedValue))
  } catch (error) {
    // console.error(`Error at setLocalStorageStore function, key: ${key}.`, { error });
  }
}


async function getCapacitorStore<T>(key: string): Promise<{ value: T, previousValue: T } | { value: null, previousValue: null }> {
  try {
    if (typeof window === 'undefined' || !isDeviceNative) return { value: null, previousValue: null }

    const result = await Preferences.get({ key });
    const stringValue = result.value;
    if (!stringValue) return { value: null, previousValue: null }

    const { value, previousValue } = JSON.parse(stringValue) as { value: T, previousValue: T }

    return { value, previousValue };
  } catch (error) {
    // console.error(`Error at getCapacitorStore function, key: ${key}.`, { error });
    return { value: null, previousValue: null }
  }
}

async function setCapacitorStore<T>({ key, value, previousValue }: { key: string, value: T, previousValue: T }) {
  try {
    if (typeof window === 'undefined' || !isDeviceNative) return
    const persistedValue = { value, previousValue }
    await Preferences.set({ key, value: JSON.stringify(persistedValue) });
  } catch (error) {
    // console.error(`Error at setCapacitorStore function, key: ${key}.`, { error });
  }
}

function areObjectsEqual(object1: any, object2: any): boolean {
  if (typeof object1 !== typeof object2) return false;
  if (object1 === object2) return true;

  if (Array.isArray(object1)) {
    if (!Array.isArray(object2) || object1.length !== object2.length) return false;
    return object1.every((value, index) => areObjectsEqual(value, object2[index]));
  }

  if (typeof object1 === 'object' && object1 !== null) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !areObjectsEqual(object1[key], object2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function areArraysEqual(array1: any[] | any, array2: any[] | any): boolean {
  if (!array1 || !array2 || array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    const value1 = array1[i];
    const value2 = array2[i];

    if (value1 !== value2) {
      if (typeof value1 === 'object' && value1 !== null) {
        if (!areObjectsEqual(value1, value2)) {
          return false;
        }
      } else if (Array.isArray(value1)) {
        if (!Array.isArray(value2) || !areArraysEqual(value1, value2)) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}