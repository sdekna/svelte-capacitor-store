type IBDDocument<T> = {
    id: string;
    value: T;
    previousValue: T;
};
declare class IndexedDBWrapper {
    private dbName;
    private storeName;
    private db;
    private initPromise;
    constructor(dbName: string, storeName: string);
    init(): Promise<void>;
    get<T>(id: string): Promise<IBDDocument<T> | undefined>;
    set<T>(document: IBDDocument<T>): Promise<void>;
}
export default IndexedDBWrapper;
