"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memoization = void 0;
class Memoization {
    static memoize(key, fn) {
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
exports.Memoization = Memoization;
Memoization.cache = new Map();
Memoization.maxSize = 1000;
