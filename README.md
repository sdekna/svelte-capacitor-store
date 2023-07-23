### Svelte Capacitor Store
A simple svelte persistent store that uses capacitor (preferences) storage on native devices, and localStorage otherwise, making it ideal for multi-platform projects.

Unlike localStorage, capacitor storage does not get deleted if device memory runs low, and will be deleted once the app is deleted.

The library exports 3 type-safe functions: `arrayStore`, `objectStore`, `variableStore`.

Usage:
```
npm i svelte-capacitor-store
```
```
<script lang="ts">

import {
 variableStore,
 arrayStore,
 objectStore
} from 'svelte-capacitor-store';

const number = variableStore<number>({
  initialValue: 1,
  storeName: 'numberStore',
  initFunction: ()=>{/* optional */}
});

const array = arrayStore<string[]>({
  initialValue: [],
  storeName: 'arrayStore'
});

const object = objectStore<{id: string} | null>({
  initialValue: null,
  storeName: 'objectStore'
});

</script>

{$number} {$array} {$object}
```

Every store will have 5 methods:
- `subscribe`, `update`, `set` : normal svelte store methods behaviors.


- `getValue`: (async) since Capacitor stores are asynchronous, the store will automatically update its value with the persisted value, however, for components that need to read the store on its initiation at the very first tick (like +layout onMount), the store (being not asynchronous) will have the `initialValue`. the `await store.getValue()` method can be used to asynchronously read the value from the persisted storage directly. (thanks to `UAAgency` for pointing this out :D)

- `reset`: this method should be used to reset the store to the `initialValue`. This is especially important in objectStore and arrayStore, as `object.set(null)` and `array.set([])` will not change the persisted storage value.

The store will only persist data to storage if the submitted value is defined and is of the correct type.
```
$number = true // will not persist in storage.
$number = 0 // will persist in storage.
$array = 4 | "a" | [] | "[]" | null | undefined // will not persist in storage.
$array = ["a", "b"] // will persist in storage.
$array = ["a", 7, "true"] // will persist in storage but will give you a type check warning.

const object = objectStore<{id: string} | null>({initialValue: null, storeName: 'objectStore'});
object.reset() // sets and persists the store to its initial value

const object_value = await object.getValue()
```

I hope this helps, and would love to get feedback/corrections/improvements and any additional features requests.