#### update: 0.3.33:
- Apart from capacitor dependencies, the library is now free of any dependencies.
- Library is compiled to js with types. Typescript is not a required dependency anymore.

#### update: 0.3.0 (major - non-breaking):
-  Build-in svelte stores creation and operation logic can be restrictive especially when dealing with async operations, thus built-in svelte-stores were ditched entirely and opted for more tuned and specialized implementation, while behaving/used the same as built-in stores.

- Optimized Non-Native Browser Storage: For better performance and reduced blocking, non-native browser storage now defaults to using `IndexedDB`. Each store is stored in a separate indexedDB document providing a non-blocking performance boost for reads and writes. Should you prefer a different approach. Could be set to `localStorage` via the `browserStorage` option.

- To avoid any breaking changes, an automatic migration logic is introduced. In non-native devices, during store initialization, if the value could not be retrieved from `indexedDB`, the store will try to retrieve it from `localStorage`, if it exists, it will migrate it to `indexedDB` then delete the `localStorage` record.

- a new method (sync) `store.get()` now returns the store value synchronously, which is much more performant than the standard `get(store)` (though it could still be used), and eliminates unnecessary and possibly costly subscribe and unsubscribe.

#### update: 0.2.3: 
  - Each store now exports an async `.init()` method, and accepts an optional `noDuplication` option.
  - `initialValue` will now only be set to the store if no persisted values are in storage (if persisted `true`).

#### update: 0.2.2:
  - bug fix for `Cannot read properties of undefined (reading 'unsubscribe')` during ssr.
#### update: 0.2.1:
  - Major update... complete persistance logic rewrite. New features and complete typescript support.
#### update: 0.1.3:
  - bug fix in native capacitor storage.


## Introduction
The **Svelte Capacitor Store** library is designed to provide advanced state management capabilities for Svelte applications. With support for persistent storage through `Capacitor Preferences` in native devices and `indexedDB` (default) or `localStorage`, which can enhance your ability to manage and maintain valid data across multiple platforms on a single code-base, with extra svelte sauces...

## Installation
To install the library: `npm install svelte-capacitor-store` or copy `src/index.ts` and `src/indexeddb-wrapper.ts` directly to your project.

## Usage
#### Configuration Options:
All exported store functions accept the following configuration options:

storeName (required) (string): A unique identifier for the store.
- `initialValue` (required): The initial value for the store. It will only be set if the store has no persisted value in storage.
- `persist` (optional): Set to `true` to enable persistent storage.
- `validationStatement` (optional): A function that validates the incoming value before updating the store. The function provides 1 parameter:
	- `value`: the value that needs to be validated before updating the store. The `value` is guaranteed to not be `null` or `undefined` so no need for `if(value)`, in case of `arrayStore` it is guaranteed to not be `null` or `undefined` and also is an array, so no need for `if(Array.isArray(value))`.
- `initFunction` (optional) (async): An async function that gets executed inside a try/catch block on store initialization. The function provides 4 parameters:
	- `currentValue`: the current stored value. (could be `null`)
	- `previousValue`: the previous stored value. (could be `null`)
	- `set`: the `customSet` function to update the store value if needed.
	- `reset`: reset the store value to `initialValue` if needed.
- `noDuplication` (optional) (boolean): If set to `true`, on each new update request, it will compare new update value with the current store value, before making any further validations, and will only continue if the new value is different from the current value. It works recursively for objects, arrays, and variables. It can be used to avoid unnecessary updates/triggers/reads/writes.
- `browserStorage` (optional) ('indexedDB' | 'localStorage'): Set to `'localStorage'` for browser storage using localStorage. Defaults to `'IndexedDB'`.

#### Methods
Each store  (`arrayStore`, `objectStore`, `variableStore`) instance provides the following methods:

- `getValue` (async):  `const { value, previousValue } = await getValue()` returns the stored current and previous values directly from the persisted storage. Useful to read the store value of a store that is not yet initialized (e.g. needing the values on `onMount`).
- `reset`: This method should be used to reset the store to the `initialValue`. This is especially important in `objectStore` , as `objectStore.set(null)` will not update the store value.
- `set(value)`: Sets a new value for the store.
- `update(currentValue, previousValue(optional))`: Updates the store using a callback function providing current and previous values.
- `subscribe(currentValue, previousValue(optional))`: Subscribes to changes in the store, providing current and previous values.
- `init()` (async): Manually initialize the store before it having to be read. Could be useful in critical stores like auth or profile stores.
- `get()`(sync): returns the current store value (not from storage) synchronously, which is much more performant than the standard `get(store)` (though it could still be used), as it eliminates unnecessary and possibly costly subscribe and unsubscribe.


#### Creating an Array Store
The `arrayStore` function creates a store for arrays. The `arrayStore` will only allow defined array values, thus in the `validationStatement`, the `value` is already defined and is an array. Any update that does not pass the `validationStatement` (i.e. the function returns `false`) will not be set and thus will not be persisted.
```js
import { arrayStore } from 'svelte-capacitor-store';
const myArrayStore = arrayStore<StoreType[]>({
  storeName: 'myArrayStore',
  initialValue: [],
  persist: true,
  browserStorage: 'localStorage' // Optional: defaults to 'indexedDB'
  validationStatement: (value) => {
  // if(!Array.isArray(value)) return false // this is not necessary as it is already applied to every update by default
  return value.every((item)=>item.price > 0)
  },

});
```

#### Creating an Object Store
The `objectStore` function creates a store for objects. It supports validation and can persist data based on the platform.
```js
import { objectStore } from 'svelte-capacitor-store';
const myObjectStore = objectStore<StoreType>({
  storeName: 'myObjectStore',
  initialValue: {},
  persist: true,
  validationStatement: (value) => {
  // if(!value) return false // this is unecessary as it is already applied to every update by default
  return value.id ? true : false
  }
});
```

#### Creating a Variable Store
The `variableStore` function creates a store for general variables. It provides options for validation and persistence.
```js
import { variableStore } from 'svelte-capacitor-store';
const myVariableStore = variableStore<number>({
  storeName: 'myVariableStore',
  initialValue: 0,
  persist: true,
  validationStatement: (value) => typeof value === 'number' && value > 5 && value <11,
});
```

#### Subscribing to Store Changes
You can subscribe to changes in the store's value using the `subscribe` method.
```js
const unsubscribe = myArrayStore.subscribe((newValue, oldValue) => {
  console.log('New value:', newValue);
  console.log('Old value:', oldValue);
});

// To unsubscribe, call the function returned by `subscribe`
unsubscribe();

// OR simply
$myArrayStore
```

#### Updating Store Values
You can update the store's value using the `update` method, which accepts a callback to compute the new value based on the old value.
```js
myStore.update((currentValue, previousValue) => {
  // Compute and return the new value
  return (currentValue + previousValue) / 2
});
```

#### Getting Store Values Directly from Storage (async)
To retrieve the current and previous values of the store, use the `getValue` method.
```js
const { value, previousValue } = await myStore.getValue();
```

#### Getting Store Value
To retrieve the current store value, use the `get` method or svelte `get()`.
```js
const value = myStore.get();
// or
import { get } from 'svelte/store';
const value = get(myStore)

```

#### Resetting Store Values
Resetting the store to its initial value can be done using the `reset` method.
```js
myStore.reset();
```

## Examples

#### Example 1: Using the `validationStatement` Function
```js
const persistedStore = variableStore({
  initialValue: 0,
  persist: true,
  storeName: 'persistedCounter',
  validationStatement: (value) => value > 15 && value < 29,
});
```

#### Example 2: Non Persisted Store with `initFunction`

```js
const profileStore = objectStore<ProfileType | null>({
  initialValue: null,
  storeName: 'profileStore',
  initFunction: async (currentValue, oldValue, set, reset) => {
    const data = await fetchData();
    if (data?.id) set(data);
  }
});
```
#### Example 3: Combining Functions

```js
const ordersStore = arrayStore<Orders[]>({
  initialValue: [],
  storeName: 'ordersStore',
  persist: true,
  validationStatement: (value) => value.every((order) => order.id),
  initFunction: async (currentValue, oldValue, set, reset) => {
    if (currentValue) return
    const res = await fetch(''/* endpoint, {options} */)
    const data = await res.json() as Orders[] | null
    if(Array.isArray(data) && data.length > 0) set(data)
    else reset()
  }
});
```

#### Example 4: Persisted Store as an SDK

```js
function createOrdersStore() {
  const store = arrayStore<Order[]>({
    initialValue: [],
    storeName: 'ordersStore',
    persist: true,
    validationStatement: (value) => value.every((order) => order.id),
    initFunction: async (currentValue, oldValue, set, reset) => {
      if (!currentValue) await handlers.getOrders();
    }
  });

  const { update, set, reset } = store;
  
  const handlers = {
    getOrders: async () => {
      const res = await fetch('' /*endpoint*/, {/*opetions*/});
      const data = (await res.json()) as Order[] | null;
      if (!data) return;
      if (Array.isArray(data)) set(data);
      // else reset();
    },
    postOrder: async (order): Promise<{ success: boolean; data: Order | null }> => {
      const res = await fetch('' /*endpoint*/, {/*opetions*/});
      const data = (await res.json()) as Order | null;
      if (!data) return { success: false, data: null };
      update((store) => [...store, data]);
      return { success: true, data };
    },
    deleteOrder: async (orderId: string) => {
    const res = await fetch('' /*endpoint*/, {/*opetions*/});
      const data = (await res.json()) as string | null;
      if (data) {
      update((store) => store.filter((order) => order.id !== data));
      }
    }
  };

return { ...store, ...handlers };
}

const ordersStore = createOrdersStore();
```
The store will already be populated using the `initFunction`... any other interactions with the store can be done via the handlers, making it something like an "sdk".

Store data can be accessed as normal via `$ordersStore` or other methods. Interactions and mutations to the store are done in a single unified place, and could be used like this: 
- `await ordersStore.postOrder(orderData)`
- `await ordersStore.deleteOrder(orderId)`


### Support and Contributions
Your feedback, bug reports, and feature ideas are highly valuable. Feel free to create an issue or a discussion to share your thoughts. If you're interested, you can also contribute by submitting pull requests with your code changes or new features. Contributions, corrections, and enhancements are always welcome.