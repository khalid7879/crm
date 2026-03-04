import React from "react";
import { WhenVisible } from "@inertiajs/react";
import { useLazyImages } from "@/hooks/useLazyImages";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";

/**
 * @component LazyImageComponent
 *
 * @description
 * A wrapper component that delays the rendering of its children until the section enters the viewport
 * (using Inertia.js's `<WhenVisible>` component) and provides lazily loaded image data via the
 * `useLazyImages` hook.
 *
 * This component is useful for optimizing performance in sections containing multiple images,
 * ensuring that image loading logic (e.g., intersection observation, placeholder handling) only
 * runs when the user scrolls near the section.
 *
 * The `children` prop receives the `images` object returned by `useLazyImages(keys)`, allowing
 * flexible rendering of lazy-loaded images inside the visible area.
 *
 * @param {Object} props
 * @param {string[]} [props.keys=[]] - Array of image keys passed to `useLazyImages` to track and manage lazy loading.
 * @param {number} [props.buffer=300] - Viewport buffer (in pixels) for `<WhenVisible>`. The children render when the element is within this distance from the viewport.
 * @param {React.ReactNode} [props.fallback=<div>Loading...</div>] - Fallback content displayed while the section is not yet visible.
 * @param {Function} props.children - Render prop function that receives the `images` object and returns the JSX to render.
 * @param {Object} props.children.images - The images state/object returned by `useLazyImages`.
 *
 * @returns {JSX.Element}
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function LazyImageComponent({
    keys = [],
    buffer = 400,
    fallback = <LoadingSpinner showTitle={false} />,
    children,
}) {
    const images = useLazyImages(keys);

    return (
        <WhenVisible data="lazy-images" buffer={buffer} fallback={fallback}>
            {children(images)}
        </WhenVisible>
    );
}
