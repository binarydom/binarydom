export declare class Memoization {
    private static cache;
    private static maxSize;
    static memoize<T>(key: string, fn: () => T): T;
    static clear(): void;
}
