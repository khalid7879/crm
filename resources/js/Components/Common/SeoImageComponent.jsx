import React from "react";

/**
 * @component SeoImageComponent
 * @description
 * A lightweight, SEO-friendly and performance-optimized image component for React + Inertia.js projects.
 *
 * Renders a standard <img> element with built-in best practices to improve Core Web Vitals:
 * - Explicit width and height attributes to prevent layout shifts (CLS)
 * - Smart lazy loading with optional eager loading for critical images (LCP optimization)
 * - Optimized decoding and fetch priority based on the `priority` prop
 * - Full support for custom classes and accessible alt text
 *
 * Perfect replacement for heavier image components (e.g., Next.js Image) in non-Next.js environments.
 *
 * @param {string} src - The source URL of the image
 * @param {string} alt - Accessible description of the image (required for SEO and accessibility)
 * @param {number|string} width - Image width in pixels (required to prevent CLS)
 * @param {number|string} height - Image height in pixels (required to prevent CLS)
 * @param {boolean} [priority=false] - Set to true for above-the-fold or LCP images to load eagerly with high priority
 * @param {string} [className=""] - Additional Tailwind/utility classes to apply
 *
 * @example
 * -- Basic usage (lazy loaded) --
 * <SeoImageComponent
 *   src="/images/hero-dashboard.png"
 *   alt="CRM Dashboard Overview"
 *   width={1200}
 *   height={800}
 *   className="w-full rounded-xl shadow-lg"
 * />
 *
 * -- Priority usage (e.g., hero image) --
 * <SeoImageComponent
 *   src="/images/logo.svg"
 *   alt="IhelpBD CRM Logo"
 *   width={200}
 *   height={60}
 *   priority={true}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function SeoImageComponent({
    src,
    alt,
    width,
    height,
    priority = false,
    className = "",
}) {
    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            className={className}
        />
    );
}
