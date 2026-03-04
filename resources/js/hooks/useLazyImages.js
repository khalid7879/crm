import { imageRegistry } from "@/utils/images";

/**
 * @method useLazyImages
 *
 * @description
 * A custom React hook that returns a subset of images from the global `imageRegistry` based on provided keys.
 * This hook is designed to be used in conjunction with lazy-loaded sections (e.g., `<WhenVisible>`) to ensure
 * that only the necessary image references are computed and passed to components when they become visible.
 *
 * If no keys are provided (empty array), it returns the entire `imageRegistry` object.
 * If keys are provided, it returns a new object containing only the entries whose keys exist in `imageRegistry`.
 *
 * This helps prevent unnecessary memory usage or processing of unused image references in large lists or
 * sections that are initially off-screen.
 *
 * @param {string[]} [keys=[]] - An array of image keys to extract from the `imageRegistry`. If empty, the full registry is returned.
 *
 * @returns {Object} An object containing image references:
 *           - Full `imageRegistry` if no keys provided.
 *           - Filtered object with only matching keys otherwise.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com> 
 */
export function useLazyImages(keys = []) {
    if (keys.length === 0) {
        return imageRegistry;
    }

    return keys.reduce((acc, key) => {
        if (imageRegistry[key]) {
            acc[key] = imageRegistry[key];
        }
        return acc;
    }, {});
}
