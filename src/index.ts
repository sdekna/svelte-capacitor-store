import IndexedDBWrapper from './indexeddb-wrapper'
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isDeviceNative = Capacitor.isNativePlatform();

let indexedbInitialized = false
let indexedDbWrapper: IndexedDBWrapper


export type ArrayStoreInputType<T> = {
  storeName: string,
  initialValue: T,
  noDuplication?: boolean,
  persist?: boolean,
  initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>,
  validationStatement?: (value: NonNullable<T>) => boolean,
  browserStorage?: 'localStorage' | 'indexedDB'
}

export function arrayStore<T>({ storeName, noDuplication, persist, initialValue, browserStorage = 'indexedDB', initFunction, validationStatement }: ArrayStoreInputType<T>) {

  if (browserStorage === 'indexedDB' && !indexedDbWrapper && typeof window !== 'undefined') {
    if (!window?.indexedDB) browserStorage = 'localStorage'
    else {
      indexedDbWrapper = new IndexedDBWrapper('persistance-database', 'main-store')
      indexedDbWrapper.init().then(() => (indexedbInitialized = true))
    }
  }
  let currentValue: T = initialValue
  let previousValue: T | null = initialValue;

  const subscribers = new Set<(value: T, previousValue: T | null) => void>();

  // const { set } = writable(initialValue) as Writable<T>;

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
      } else if (browserStorage === 'indexedDB') {
        if (!indexedbInitialized) await indexedDbWrapper.init()
        const { value, previousValue } = await getIndexedDBStore<T>(storeName)
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

  const set = (value: T): void => {
    if (typeof window === 'undefined' || !Array.isArray(value)) return

    if (noDuplication && currentValue && areArraysEqual(value, currentValue)) return

    if (validationStatement && !validationStatement(value)) return

    previousValue = currentValue;
    currentValue = value;
    if (persist) persistStore(storeName, value, previousValue, browserStorage)

    broadcastValue(value, previousValue)
  };

  async function init() {
    if (typeof window === 'undefined' || !persist) return
    if (!isDeviceNative && browserStorage === 'indexedDB' && !indexedbInitialized) {
      if (!window?.indexedDB) browserStorage = 'localStorage'
      else {
        await indexedDbWrapper.init()
        indexedbInitialized = true
      }
    }

    let storedValue: T | null
    let storedPreviousValue: T | null

    {
      const { value, previousValue } = await getValue()
      storedValue = value
      storedPreviousValue = previousValue
    }

    if (!isDeviceNative && browserStorage === 'indexedDB' && storedValue == null && storedPreviousValue == null) {
      const { value, previousValue } = getLocalStorageStore<T>(storeName)

      if (Array.isArray(value) && (!validationStatement || (validationStatement && validationStatement(value)))) {
        persistStore(storeName, value, previousValue, browserStorage)
        localStorage.removeItem(storeName);
      }

      storedValue = value
      storedPreviousValue = previousValue
    }

    const initialSetValue = !validationStatement && Array.isArray(storedValue) ? storedValue
      : validationStatement && Array.isArray(storedValue) && validationStatement(storedValue) ? storedValue
        : initialValue


    currentValue = initialSetValue

    if (storedPreviousValue !== null) previousValue = storedPreviousValue

    broadcastValue(initialSetValue, previousValue)

    if (initFunction) {
      try {
        await initFunction(storedValue, previousValue, set, reset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  init()

  const subscribe = (callback: (value: T, previousValue: T | null) => void) => {
    subscribers.add(callback);
    callback(currentValue, previousValue);

    return () => {
      subscribers.delete(callback);
    };
  };

  const update = (callback: (value: T, previousValue: T | null) => T): void => {
    const newValue = callback(structuredClone(currentValue), previousValue);
    if (Array.isArray(newValue)) set(newValue)
  };


  function reset() {
    if (typeof window === 'undefined') return
    // set(initialValue)

    previousValue = currentValue;
    currentValue = initialValue;

    if (persist) persistStore(storeName, initialValue, previousValue, browserStorage)

    broadcastValue(initialValue, previousValue)
  }

  function broadcastValue(value: T, previousValue: T | null) {
    subscribers.forEach((callback) => {
      callback(value, previousValue);
    });
  }
  function get() {
    return currentValue
  }
  return {
    getValue,
    subscribe,
    update,
    reset,
    init,
    get,
    set,
  }
}



export type ObjectStoreInputType<T> = {
  storeName: string,
  initialValue: T,
  noDuplication?: boolean,
  persist?: boolean
  validationStatement?: (value: NonNullable<T>) => boolean,
  initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>,
  browserStorage?: 'localStorage' | 'indexedDB'
}

export function objectStore<T>({ storeName, noDuplication, initialValue, browserStorage = 'indexedDB', initFunction, validationStatement, persist }: ObjectStoreInputType<T>) {

  if (browserStorage === 'indexedDB' && !indexedDbWrapper && typeof window !== 'undefined') {
    if (!window?.indexedDB) browserStorage = 'localStorage'
    else {
      indexedDbWrapper = new IndexedDBWrapper('persistance-database', 'main-store')
      indexedDbWrapper.init().then(() => (indexedbInitialized = true))
    }
  }
  let currentValue: T = initialValue
  let previousValue: T | null = initialValue;

  const subscribers = new Set<(value: T, previousValue: T | null) => void>();

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

      } else if (browserStorage === 'indexedDB') {
        if (!indexedbInitialized) await indexedDbWrapper.init()
        const { value, previousValue } = await getIndexedDBStore<T>(storeName)
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

  const set = (value: T): void => {
    if (typeof window === 'undefined' || !value) return

    if (noDuplication && currentValue && areObjectsEqual(value, currentValue)) return
    if (validationStatement && !validationStatement(value)) return

    previousValue = currentValue;
    currentValue = value;
    if (persist) persistStore(storeName, value, previousValue, browserStorage)

    broadcastValue(currentValue, previousValue)
  };

  async function init() {
    if (typeof window === 'undefined' || !persist) return
    if (browserStorage === 'indexedDB' && !indexedbInitialized) {
      if (!window?.indexedDB) browserStorage = 'localStorage'
      else {
        await indexedDbWrapper.init()
        indexedbInitialized = true
      }
    }

    let storedValue: T | null
    let storedPreviousValue: T | null

    {
      const { value, previousValue } = await getValue()
      storedValue = value
      storedPreviousValue = previousValue
    }

    if (browserStorage === 'indexedDB' && storedValue == null && storedPreviousValue == null) {
      const { value, previousValue } = getLocalStorageStore<T>(storeName)

      if (value && (!validationStatement || (validationStatement && validationStatement(value)))) {
        persistStore(storeName, value, previousValue, browserStorage)
        localStorage.removeItem(storeName);
      }

      storedValue = value
      storedPreviousValue = previousValue
    }

    const initialSetValue = !validationStatement && storedValue ? storedValue
      : validationStatement && storedValue && validationStatement(storedValue) ? storedValue
        : initialValue

    currentValue = initialSetValue

    if (storedPreviousValue !== null) previousValue = storedPreviousValue

    broadcastValue(initialSetValue, previousValue)

    if (initFunction) {
      try {
        await initFunction(initialSetValue, previousValue, set, reset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  init()

  const subscribe = (callback: (value: T, previousValue: T | null) => void) => {
    subscribers.add(callback);
    callback(currentValue, previousValue);

    return () => {
      subscribers.delete(callback);
    };
  };

  const update = (callback: (value: T, previousValue: T | null) => T): void => {
    const newValue = callback(structuredClone(currentValue), previousValue);
    if (newValue) set(newValue)
  };


  function reset() {
    if (typeof window === 'undefined') return

    previousValue = currentValue;
    currentValue = initialValue;
    if (persist) persistStore(storeName, initialValue, previousValue, browserStorage)

    broadcastValue(initialValue, previousValue)
  }


  function broadcastValue(value: T, previousValue: T | null) {
    subscribers.forEach((callback) => {
      callback(value, previousValue);
    });
  }
  function get() {
    return currentValue
  }
  return {
    getValue,
    subscribe,
    update,
    reset,
    init,
    get,
    set,
  }
}


export type VariableStoreInputType<T> = {
  storeName: string,
  initialValue: T,
  noDuplication?: boolean,
  validationStatement?: (value: NonNullable<T>) => boolean,
  persist?: boolean,
  initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>,
  browserStorage?: 'localStorage' | 'indexedDB'

}

export function variableStore<T>({ storeName, noDuplication, initialValue, browserStorage = 'indexedDB', initFunction, validationStatement, persist }: VariableStoreInputType<T>) {

  if (browserStorage === 'indexedDB' && !indexedDbWrapper && typeof window !== 'undefined') {
    if (!window?.indexedDB) browserStorage = 'localStorage'
    else {
      indexedDbWrapper = new IndexedDBWrapper('persistance-database', 'main-store')
      indexedDbWrapper.init().then(() => (indexedbInitialized = true))
    }
  }
  let currentValue: T = initialValue
  let previousValue: T | null = initialValue;

  const subscribers = new Set<(value: T, previousValue: T | null) => void>();

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

      } else if (browserStorage === 'indexedDB') {
        if (!indexedbInitialized) await indexedDbWrapper.init()
        const { value, previousValue } = await getIndexedDBStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value
      } else {
        const { value, previousValue } = getLocalStorageStore<T>(storeName)
        storedPreviousValue = previousValue
        storedValue = value
      }

      if (storedValue != null) return { value: storedValue, previousValue: storedPreviousValue }

      return { value: null, previousValue: null }

    } catch (error) {
      // console.error(`Error at getValue function, store: ${storeName}.`, { error });
      return { value: null, previousValue: null }
    }
  }



  const set = (value: T): void => {
    if (typeof window === 'undefined' || value == null) return
    if (noDuplication && currentValue !== null && value === currentValue) return

    previousValue = currentValue;
    currentValue = value;
    if (persist) persistStore(storeName, value, previousValue, browserStorage)

    broadcastValue(value, previousValue)
  };

  async function init() {
    if (typeof window === 'undefined' || !persist) return
    if (browserStorage === 'indexedDB' && !indexedbInitialized) {
      if (!window?.indexedDB) browserStorage = 'localStorage'
      else {
        await indexedDbWrapper.init()
        indexedbInitialized = true
      }
    }

    let storedValue: T | null
    let storedPreviousValue: T | null

    {
      const { value, previousValue } = await getValue()
      storedValue = value
      storedPreviousValue = previousValue
    }

    if (browserStorage === 'indexedDB' && storedValue == null && storedPreviousValue == null) {
      const { value, previousValue } = getLocalStorageStore<T>(storeName)

      if (value != null && (!validationStatement || (validationStatement && validationStatement(value)))) {
        persistStore(storeName, value, previousValue, browserStorage)
        localStorage.removeItem(storeName);
      }

      storedValue = value
      storedPreviousValue = previousValue
    }


    const initialSetValue = !validationStatement && storedValue != null ? storedValue
      : validationStatement && storedValue != null && validationStatement(storedValue) ? storedValue
        : initialValue

    currentValue = initialSetValue

    if (storedPreviousValue !== null) previousValue = storedPreviousValue

    broadcastValue(initialSetValue, previousValue)

    if (initFunction) {
      try {
        await initFunction(storedValue, previousValue, set, reset)
      } catch (error) {
        console.error(error)
      }
    }
  }

  init()

  const subscribe = (callback: (value: T, previousValue: T | null) => void) => {
    subscribers.add(callback);
    callback(currentValue, previousValue);

    return () => {
      subscribers.delete(callback);
    };
  };

  const update = (callback: (value: T, previousValue: T | null) => T): void => {
    const newValue = callback(structuredClone(currentValue), previousValue);
    if (newValue != null) set(newValue)
  };


  function reset() {
    if (typeof window === 'undefined') return

    previousValue = currentValue;
    currentValue = initialValue;

    if (persist) persistStore(storeName, initialValue, previousValue, browserStorage)
    broadcastValue(initialValue, previousValue)
  }


  function broadcastValue(value: T, previousValue: T | null) {
    subscribers.forEach((callback) => {
      callback(value, previousValue);
    });
  }
  function get() {
    return currentValue
  }
  return {
    getValue,
    subscribe,
    update,
    reset,
    init,
    set,
    get,
  }
}


async function persistStore<T>(key: string, value: T, previousValue: T, browserStorage: 'localStorage' | 'indexedDB') {
  if (isDeviceNative) await setCapacitorStore<T>({ key, value, previousValue })
  else if (browserStorage === 'indexedDB') await setIndexedDBStore<T>({ key, value, previousValue })
  else setLocalStorageStore<T>({ key, value, previousValue })
}

async function getIndexedDBStore<T>(key: string): Promise<{ value: T | null, previousValue: T | null }> {
  const document = await indexedDbWrapper.get<T>(key)
  if (!document) return { value: null, previousValue: null }
  const { value, previousValue } = document
  return { value, previousValue }
}

async function setIndexedDBStore<T>({ key, value, previousValue }: { key: string, value: T, previousValue: T }) {
  const insertDocument = { id: key, value, previousValue };
  console.log({ type: 'set', store: key, insertDocument })
  return indexedDbWrapper.set<T>(insertDocument)
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