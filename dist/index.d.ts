export type ArrayStoreInputType<T> = {
    storeName: string;
    initialValue: T;
    noDuplication?: boolean;
    persist?: boolean;
    initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>;
    validationStatement?: (value: NonNullable<T>) => boolean;
    browserStorage?: 'localStorage' | 'indexedDB';
};
export declare function arrayStore<T>({ storeName, noDuplication, persist, initialValue, browserStorage, initFunction, validationStatement }: ArrayStoreInputType<T>): {
    getValue: () => Promise<{
        value: T;
        previousValue: T | null;
    } | {
        value: null;
        previousValue: null;
    }>;
    subscribe: (callback: (value: T, previousValue: T | null) => void) => () => void;
    update: (callback: (value: T, previousValue: T | null) => T) => void;
    reset: () => void;
    init: () => Promise<void>;
    get: () => T;
    set: (value: T) => void;
};
export type ObjectStoreInputType<T> = {
    storeName: string;
    initialValue: T;
    noDuplication?: boolean;
    persist?: boolean;
    validationStatement?: (value: NonNullable<T>) => boolean;
    initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>;
    browserStorage?: 'localStorage' | 'indexedDB';
};
export declare function objectStore<T>({ storeName, noDuplication, initialValue, browserStorage, initFunction, validationStatement, persist }: ObjectStoreInputType<T>): {
    getValue: () => Promise<{
        value: T;
        previousValue: T | null;
    } | {
        value: null;
        previousValue: null;
    }>;
    subscribe: (callback: (value: T, previousValue: T | null) => void) => () => void;
    update: (callback: (value: T, previousValue: T | null) => T) => void;
    reset: () => void;
    init: () => Promise<void>;
    get: () => T;
    set: (value: T) => void;
};
export type VariableStoreInputType<T> = {
    storeName: string;
    initialValue: T;
    noDuplication?: boolean;
    validationStatement?: (value: NonNullable<T>) => boolean;
    persist?: boolean;
    initFunction?: (currentValue: T | null, previousValue: T | null, set: (this: void, value: T) => void, reset: () => void) => Promise<void>;
    browserStorage?: 'localStorage' | 'indexedDB';
};
export declare function variableStore<T>({ storeName, noDuplication, initialValue, browserStorage, initFunction, validationStatement, persist }: VariableStoreInputType<T>): {
    getValue: () => Promise<{
        value: T;
        previousValue: T | null;
    } | {
        value: null;
        previousValue: null;
    }>;
    subscribe: (callback: (value: T, previousValue: T | null) => void) => () => void;
    update: (callback: (value: T, previousValue: T | null) => T) => void;
    reset: () => void;
    init: () => Promise<void>;
    set: (value: T) => void;
    get: () => T;
};
