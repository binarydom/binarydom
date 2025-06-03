export class Memoization {
  private static cache = new Map<string, any>();
  private static maxSize = 1000;

  static memoize<T>(key: string, fn: () => T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = fn();
    this.cache.set(key, result);

    // Clean up if cache is too large
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return result;
  }

  static clear() {
    this.cache.clear();
  }
}
