# Svelte Capacitor Store

#### update: 0.1.3: bug fix in native capacitor storage.

### Introduction
The library provides three custom Svelte stores: `arrayStore`, `objectStore`, and `variableStore`, which allow you to create persistent data stores with custom data validation options. The data stored in these stores is persisted locally using Capacitor's Preferences plugin on native devices, and in the browser (using `localStorage`) otherwise.

### Prerequisites

Before using this library, ensure that you have Svelte and Capacitor (if planning to run on native platforms) properly set up in your project.

### Installation

To use the library, you can install it via npm:
`npm install svelte-capacitor-store`
or install dependencies manually and copy paste/customize `/src/index.ts` in your code directly.

### Usage

The library provides three main store types: `arrayStore`, `objectStore`, and `variableStore`. Each store type serves different data structures and comes with built-in persistence and custom data validation capabilities.

#### `arrayStore`

The `arrayStore` is suitable for managing arrays of data and offers the following features:

##### Parameters:
- `storeName` (string): A unique name to identify the store in storage.
- `initialValue` (T): The initial value for the store.
- `initFunction` (optional, function): A function to be called after the store is initialized.
- `validationStatement` (optional, function): A custom validation function that determines whether a new value should be accepted or not.

##### Example:
```js
import { arrayStore } from 'svelte-capacitor-store';

const myArrayStore = arrayStore<number[]>({
storeName: 'myArrayStore',
initialValue: [1, 2, 3],
validationStatement: (value) => value.every((item) => item > 1 && item < 9),
});
```

### `objectStore`

The `objectStore` is designed for managing objects and provides the following capabilities:

##### Parameters:
- `storeName` (string): A unique name to identify the store in storage.
- `initialValue` (T): The initial value for the store.
- `initFunction` (optional, function): A function to be called when the store initializes.
- `validationStatement` (optional, function): A custom validation function to validate the new object. 

##### Example:
```js
import { objectStore } from 'svelte-capacitor-store';

const myObjectStore = objectStore<MyData>({
storeName: 'myObjectStore',
initialValue: { name: 'John', age: 25 },
validationStatement: (value) => value.name && value.age && value.age > 18,
});
```

### `variableStore`

The `variableStore` is suitable for storing and validating any data type, providing the following functionalities:

##### Parameters:
- `storeName` (string): A unique name to identify the store in storage.
- `initialValue` (T): The initial value for the store.
- `initFunction` (optional, function): A function to be called when the store initializes.
- `validationStatement` (optional, function): A custom validation function to validate the new value.

##### Example:
```js
import { variableStore } from 'svelte-capacitor-store';

const myVariableStore = variableStore<string>({
  storeName: 'myVariableStore',
  initialValue: 'Hello, World!',
  validationStatement: (value) => typeof value === "string" && value.length < 50,
});
```

### Custom Data Validation
##### customSet function:
The custom data validation is achieved through the optional `validationStatement` parameter in each store type. If a `validationStatement` is provided, the store will use the **customSet** function instead of the original `set` function, which first validates the data before setting or updating the store's value and consequently persist the data to storage. If the validation function returns `true`, the new value will be accepted and stored. If it returns `false`, the new value will be rejected, hence the store and storage values will not be updated.

This feature is essential in ensuring that only valid and structured data is populated and persisted. In cases where invalid data is set to the store or persisted storage is unexpectedly corrupted, the store and its persistent value will automatically revert to its previous valid value, avoiding any potential data crashes or inconsistencies even if they unexpectedly occur.
##### customUpdate function:
works the same as the original `update` function, but calls `customSet()` function to update (or try to) the store.

### The customSubscribe Function
The `customSubscribe` function is an extended version of the original store's `subscribe` function, providing a callback that includes both the new `value` of the store and the optional `oldValue` and used like this:  `store.subscribe(value, /* old_value */)`

The function is also invoked when the store is created, and is triggered when a new value is set to the store. It performs the following actions:

1. **Data Validation** (if applicable): It verifies if the `value` is valid data by checking its type, presence, and, if applicable, it runs the custom `validationStatement` provided during store creation. If the `validationStatement` is not met, the `customSubscribe` function reverts to the `lastValue` or the `initialValue`, maintaining a consistent state.
2. **Data Persistence**: After the validation step, the function proceeds to store the data. If the application is running on a native platform (`isDeviceNative`), the data is stored using the Capacitor Preferences Plugin with the provided `storeName` key. Otherwise, for non-native platforms, such as web, the data is stored using `localStorage` with the same `storeName` key.

### Store Methods
Every store type (`arrayStore`, `objectStore`, and `variableStore`) comes with five methods: `subscribe`, `set`, `update` and:
-  **`getValue`** (async): The store will automatically update its value with the persisted value, however, since Capacitor stores are asynchronous, for components that need to read the store on before or during its initial initialization (at the first tick like +layout onMount), the store (being not asynchronous) will have the value of the initialValue. The `await store.getValue()` method can be used in such cases to asynchronously read the value from the persisted storage directly.
- **`reset`**: This method should be used to reset the store to the initialValue. This is especially important in `objectStore` and `arrayStore`, as `object.set(null)` and `array.set([])` will not change the persisted storage value.

### Important Notes
- The library requires Svelte and Capacitor libraries to be properly set up in your project.
- Make sure to provide unique `storeName` values for each store to avoid data conflicts.
- When using data validation, be aware that strict validation rules may result in rejected updates to the store.

### Support and Contributions

I hope this helps, and for any questions, bug reports, or feature requests related to this library, please create an issue. Any contributions/corrections/enhancements are very welcome.