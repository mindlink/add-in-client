/**
 * Merges the source object into the target object.
 *
 * @param target The object to merge into.
 * @param source The object to merge.
 * @returns The merged target.
 */
export function merge(target: any, source: any): any {
    if (source) {
        for (var attr in source) {
            if (source.hasOwnProperty(attr)) {
                target[attr] = source[attr];
            }
        }
    }

    return target;
}

/**
 * Gets a value indicating whether any elements match the given predicate.
 *
 * @param array The array to check for matches.
 * @param predicate The function predicate performing the comparison.
 * @returns `true` if any element in the array matches the predicate, `false` otherwise.
 */
export function any(array: Array<any>, predicate: (any) => boolean): boolean {
    let current;

    for (let i = 0; i < array.length; ++i) {
        current = array[i];

        if (predicate(current)) {
            return true;
        }
    }

    return false;
}
