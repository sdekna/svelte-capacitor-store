type IBDDocument<T> = {
  id: string;
  value: T;
  previousValue: T;
};

class IndexedDBWrapper {
  private db: IDBDatabase | undefined;
  private initPromise: Promise<void> | undefined;

  constructor(private dbName: string, private storeName: string) { }

  init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName);

        request.onupgradeneeded = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.db.createObjectStore(this.storeName, { keyPath: 'id' });
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = (event) => {
          console.log(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
          reject((event.target as IDBOpenDBRequest).error);
        };
      });
    }

    return this.initPromise;
  }

  async get<T>(id: string): Promise<IBDDocument<T> | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([this.storeName]);
      const objectStore = transaction?.objectStore(this.storeName);
      const request = objectStore?.get(id);

      request?.addEventListener('success', (event) => {
        resolve((event.target as IDBRequest).result);
      });

      request?.addEventListener('error', (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      });
    });
  }

  async set<T>(document: IBDDocument<T>): Promise<void> {
    const previousDocument = await this.get<T>(document.id);
    document.previousValue = previousDocument ? previousDocument.value : document.value;

    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([this.storeName], 'readwrite');
      const objectStore = transaction?.objectStore(this.storeName);
      const request = objectStore?.put(document);

      request?.addEventListener('success', () => {
        resolve();
      });

      request?.addEventListener('error', (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      });
    });
  }
}

export default IndexedDBWrapper;
