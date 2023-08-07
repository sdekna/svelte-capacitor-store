#### update: 0.2.0: Major update... complete persistance logic rewrite. New features and complete typescript support.
#### update: 0.1.3: bug fix in native capacitor storage.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
    - [Creating an Array Store](#creating-an-array-store)
    - [Creating an Object Store](#creating-an-object-store)
    - [Creating a Variable Store](#creating-a-variable-store)
    - [Subscribing to Store Changes](#subscribing-to-store-changes)
    - [Updating Store Values](#updating-store-values)
    - [Getting Store Values](#getting-store-values)
    - [Resetting Store Values](#resetting-store-values)
4. [Benefits](#benefits)
5. [Custom Functions](#custom-functions)
    - [`persistStore`](#persiststore)
    - [`getLocalStorageStore`](#getlocalstoragestore)
    - [`setLocalStorageStore`](#setlocalstoragestore)
    - [`getCapacitorStore`](#getcapacitorstore)
    - [`setCapacitorStore`](#setcapacitorstore)
6. [Examples](#examples)
7. [FAQ](#faq)
8. [Conclusion](#conclusion)

## Introduction
The **Svelte Capacitor Store** library is designed to provide advanced state management capabilities for Svelte applications. With support for persistent storage through `Capacitor Preferences` in native devices and browser `localStorage` otherwise, which can enhance your ability to manage and maintain valid data across multiple platforms on a single code-base, with extra svelte sauces...

## Installation
To install the library:
`npm install svelte-capacitor-store`

## Usage
#### Configuration Options:
All exported store functions accept the following configuration options:

- `storeName` (required): A **unique** string that defines the name of the store for identification.
- `initialValue` (required): The initial value for the store.
- `persist` (optional): A boolean that determines whether the store data should persist across sessions, if it is not passed or is set to `false`, then the stores will act in the same manner accept for persistence of the data.
- `validationStatement` (optional): A function that validates the incoming value before updating the store. The function provides 1 parameter:
	- `value`: the value that needs to be validated before updating the store. The `value` is guaranteed to not be `null` or `undefined` so no need for `if(value)`, in case of `arrayStore` it is guaranteed to not be `null` or `undefined` and also is an array, so no need for `if(Array.isArray(value))`.  
- `initFunction` (optional) (async): An async function that gets executed inside a try/catch block on store initialization. The function provides 4 parameters:
	- `currentValue`: the current stored value. (could be `null`)
	- `previousValue`: the previous stored value. (could be `null`)
	- `set`: the `customSet` function to update the store value if needed.
	- `reset`: reset the store value to `initialValue` if needed.

#### Methods
Each store  (`arrayStore`, `objectStore`, `variableStore`) instance provides the following methods:

- `getValue` (async):  `const { value, previousValue } = await getValue()` returns the stored current and previous values directly from the persisted storage. Useful to read the store value of a store that is not yet initialized (e.g. needing the values on `onMount`).
- `reset`: This method should be used to reset the store to the `initialValue`. This is especially important in `objectStore` and `arrayStore`, as `objectStore.set(null)` and `arrayStore.set([])` will not update the store value.
- `set(value)`: Sets a new value for the store.
- `update(callback)`: Updates the store using a callback function providing current and previous values.
- `subscribe(callback)`: Subscribes to changes in the store, providing current and previous values.

### Creating an Array Store
The `arrayStore` function creates a store for arrays. The `arrayStore` will only allow defined array values, thus in the `validationStatement`, the `value` is already defined and is an array. Any update that does not pass the `validationStatement` (i.e. the function returns `false`) will not be set and thus will not be persisted.
```js
import { arrayStore } from 'svelte-capacitor-store';
const myArrayStore = arrayStore<StoreType[]>({
  storeName: 'myArrayStore',
  initialValue: [],
  persist: true,
  validationStatement: (value) => {
  // if(!Array.isArray(value)) return false // this is not necessary as it is already applied to every update by default
  return value.every((item)=>item.price > 0)
  },

});
```

### Creating an Object Store
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

### Creating a Variable Store
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
### Subscribing to Store Changes
You can subscribe to changes in the store's value using the `subscribe` method.
```js
const unsubscribe = myArrayStore.subscribe((newValue, oldValue) => {
  console.log('New value:', newValue);
  console.log('Old value:', oldValue);
});

// To unsubscribe, call the function returned by `subscribe`
unsubscribe();
```

### Updating Store Values
You can update the store's value using the `update` method, which accepts a callback to compute the new value based on the old value.
```js
myStore.update((currentValue, previousValue) => {
  // Compute and return the new value
  return (currentValue + previousValue) / 2
});
```

### Getting Store Values
To retrieve the current and previous values of the store, use the `getValue` method.
```js
const { value, previousValue } = await myStore.getValue();
```

### Resetting Store Values
Resetting the store to its initial value can be done using the `reset` method.
```js
myStore.reset();
```

## Custom Functions
### `customSet`:
The `customSet` method plays a pivotal role in updating the store's values while preserving both the current and previous values for historical tracking.
It ensures that the new value is not only valid according to defined validation rules but also triggers subscribers with the updated and previous values.

### `customUpdate`:
The `customUpdate` method allows dynamic modification of the store's value based on a callback function that provides both the current and previous values of the store, and then passes the returned value via `customSet` so it can be fully evaluated before update.

### `customSubscribe`:
The `customSubscribe` method changes how subscribers interact with svelte stores. It enables the initial setup of subscribers, providing them with the current and previous values while ensuring they are accurately informed about changes in the store's state. 

### `persistStore`:
The `persistStore` function is responsible for persisting store values based on the platform (Capacitor or browser's local storage).
Both the previous and current values are persisted in storage. During initialization, the store retrieves these values allowing you to access both values when using the `.subscribe` or `.update` methods or by `async store.getValue()`.


These methods combined, collectively, empower developers to manage state more efficiently, with the added advantages of data validation, historical tracking, and seamless subscriber interactions.
## Examples

### Example 1: Using the `validationStatement` Function
```js
const persistedStore = variableStore({
  initialValue: 0,
  persist: true,
  storeName: 'persistedCounter',
  validationStatement: (value) => value > 15 && value < 29,
});
```

### Example 2: Non Persisted Store with `initFunction`

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
### Example 3: Combining Functions

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

### Example 4: Persisted Store as an SDK

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
      if (Array.isArray(data) && data.length > 0) set(data);
      else reset();
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

### Some Notes
- The library requires Svelte and Capacitor libraries to be properly set up in your project.
- Make sure to provide unique `storeName` values for each store to avoid data conflicts.

### Support and Contributions
Got feedback, bug reports, or feature ideas? Create GitHub issues to share your thoughts. If you're up for it, send in pull requests with your code changes or new features. Your unique perspectives can make the library even more versatile and user-friendly.  Any contributions/corrections/enhancements are very welcome.