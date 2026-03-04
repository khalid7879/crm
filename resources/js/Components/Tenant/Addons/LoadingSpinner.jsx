import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * Reusable Loading Spinner Component Using DaisyUI v5
 *
 * @param {string} style - One of: "spinner" | "bars" | "ball" | "dots" | "infinity" | "ring"
 * @param {string} color - One of: "brand" | "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error"
 * @param {string} size - One of: "xs" | "sm" | "md" | "lg" | "xl"
 * @param {boolean} showTitle - Whether to show text (default: true)
 * @param {string} title - Loading text (optional, translatable)
 * @param {string} className - Additional custom classes
 *
 * @example
 * <LoadingSpinner className="text-blue-500" title="Fetching data..." size="lg" />
 * <LoadingSpinner style="dots" size="md" showTitle={false} />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function LoadingSpinner({
    style = "spinner",
    color = "brand",
    size = "md",
    showTitle = true,
    title = "Loading",
    className = "",
    textSize = "md",
}) {
    const __ = useTranslations();

    const styleMap = {
        bars: "loading-bars",
        ball: "loading-ball",
        dots: "loading-dots",
        infinity: "loading-infinity",
        ring: "loading-ring",
        spinner: "loading-spinner",
    };

    const sizeMap = {
        xs: "loading-xs",
        sm: "loading-sm",
        md: "loading-md",
        lg: "loading-lg",
        xl: "loading-xl",
    };

    const textSizeMap = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-md",
        lg: "text-lg",
        xl: "text-xl",
    };

    const colorMap = {
        brand: "text-brandColor",
        primary: "text-primary",
        secondary: "text-secondary",
        accent: "text-accent",
        neutral: "text-neutral",
        info: "text-info",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                className={`loading ${styleMap[style]} ${sizeMap[size]} ${colorMap[color]}`}
            ></span>
            {showTitle && (
                <span className={`${textSizeMap[size]} ${colorMap[color]}`}>
                    {__(title)}
                </span>
            )}
        </div>
    );
}
