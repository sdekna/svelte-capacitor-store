### Svelte Capacitor Store
A simple svelte persistent store that uses capacitor (preferences) storage on native devices, and localStorage otherwise, making it ideal for multi-platform projects.

Unlike localStorage, capacitor storage does not get deleted if device memory runs low, and will be deleted once the app is deleted.

The library exports 3 type-safe functions: `arrayStore`, `objectStore`, `variableStore`.

Usage:
```
<script lang="ts">

import { variableStore, arrayStore, objectStore } from 'svelte-capacitor-store';

const number = variableStore<number>({initialValue: 1, storeName: 'numberStore', initFunction: ()=>{/* optional */}});

const array = arrayStore<string[]>({initialValue: [], storeName: 'arrayStore'});

const object = objectStore<{id: string} | null>({initialValue: null, storeName: 'objectStore'});

</script>

{$number} {$array} {$object}
```
The store will only persist data to storage if the submitted value is defined and is of the correct type:
```
$number = true // will not persist in storage.
$number = 0 // will persist in storage.
$array = 4 | "a" | "[]" | null | undefined // will not persist in storage.
$array = [] | ["a", "b"] // will persist in storage.
$array = ["a", 7, "true"] // will persist in storage but will give you a type check warning.
```

I hope this helps, and would love to get feedback/corrections/improvements and any additional features requests.