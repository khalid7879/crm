/**
 * Truncates a string to a specified length with optional ellipsis and word preservation
 *
 * @method _subString
 * @description
 * Creates a shortened version of the input text with configurable behavior:
 * - Trims whitespace (by default)
 * - Preserves whole words when requested
 * - Adds ellipsis (...) when truncation occurs (configurable)
 *
 *
 * @param {string} text - The original text to truncate
 * @param {number} length - Maximum length of the resulting string
 * @param {boolean} [showEllipsis=true] - Whether to append "..." when text is truncated
 * @param {Object} [options={}] - Additional configuration options
 * @param {boolean} [options.trim=true] - Whether to trim whitespace from input
 * @param {boolean} [options.preserveWords=false] - Whether to avoid cutting words in half
 * @returns {string} The truncated string
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 *
 * @import {_subString} from "@/utils/common/helpers"
 *
 * @example
 * _subString("Hello world this is a test", 11)                    // "Hello wor..."
 * _subString("Hello world this is a test", 11, true, {preserveWords: true})   // "Hello..."
 * _subString("   Spaces before   ", 10)                           // "Spaces be..."
 * _subString("Short", 20)                                         // "Short" (no truncation)
 * _subString("Hello", 0)                                          // ""
 */
export const _subString = (text, length, showEllipsis = true, options = {}) => {
    if (!text) return "";

    const { trim = true, preserveWords = false } = options;

    let str = String(text);
    if (trim) str = str.trim();

    /* Return full string if it's short enough or invalid length */
    if (str.length <= length || length < 0) return str;

    /* Zero length requested → empty string */
    if (length === 0) return "";

    let truncated = str.slice(0, length);

    if (preserveWords) {
        const lastSpace = truncated.lastIndexOf(" ");
        /* If we found a space and it's not at the beginning */
        if (lastSpace > 0) {
            truncated = truncated.slice(0, lastSpace);
        } else {
            /* If no space found → we can't preserve words, return empty */
            truncated = "";
        }
    }

    return showEllipsis && truncated.length > 0 ? truncated + "..." : truncated;
};

/**
 * Color map
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const colorMap = {
    primary: "primary",
    secondary: "secondary",
    accent: "accent",
    neutral: "neutral",
    info: "info",
    success: "success",
    warning: "warning",
    error: "error",
    base: "base-100",
    base2: "base-200",
    base3: "base-300",
    baseContent: "base-content",
    gray5: "gray-500",
    gray6: "gray-600",
    gray7: "gray-700",
    brand: "brandColor",
    white: "white",
};

/**
 * Size map
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const sizeMap = {
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
    "2xl": "2xl",
};

/**
 * Size map for modal
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const sizeMapModal = {
    sm: "w-3/12 max-w-md min-h-2/6 max-h-2/6",
    md: "w-6/12 max-w-2xl min-h-2/6 max-h-3/6",
    lg: "w-8/12 max-w-4xl min-h-4/6 max-h-4/6",
    xl: "w-10/12 max-w-5xl min-h-5/6 max-h-5/6",
    "2xl": "w-11/12 max-w-6xl h-[90vh]",
};

/**
 * Get alphabetical color names.
 *
 * @param {string[]|null} index Array of first letters or full color names (a-z)
 * @returns {Array<{hex: string, name: string}>} Returns filtered colors if index is provided,
 *          otherwise all colors sorted alphabetically by name.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const getAlphabeticalColorName = (index = null) => {
    /** Predefined colors with names */
    const colors = [
        { hex: "#06b6d4", name: "aqua" },
        { hex: "#000000", name: "black" },
        { hex: "#3f51b5", name: "blue" },
        { hex: "#0891b2", name: "cyan" },
        { hex: "#f58520", name: "coral" },
        { hex: "#AB7854", name: "coffee" },
        { hex: "#1e3a8a", name: "darkblue" },
        { hex: "#065f46", name: "emerald" },
        { hex: "#a21caf", name: "fuchsia" },
        { hex: "#92400e", name: "gold" },
        { hex: "#4caf50", name: "green" },
        { hex: "#9d174d", name: "hotpink" },
        { hex: "#4b5563", name: "ivory" },
        { hex: "#21004b", name: "indigo" },
        { hex: "#047857", name: "jade" },
        { hex: "#FEB048", name: "khaki" },
        { hex: "#6d28d9", name: "lavender" },
        { hex: "#86198f", name: "magenta" },
        { hex: "#1e40af", name: "navy" },
        { hex: "#3f6212", name: "olive" },
        { hex: "#ff7a00", name: "orange" },
        { hex: "#6b21a8", name: "purple" },
        { hex: "#57534e", name: "quartz" },
        { hex: "#ff1010", name: "red" },
        { hex: "#760000", name: "darkred" },
        { hex: "#404040", name: "silver" },
        { hex: "#115e59", name: "teal" },
        { hex: "#312e81", name: "ultramarine" },
        { hex: "#581c87", name: "violet" },
        { hex: "#374151", name: "white" },
        { hex: "#14532d", name: "xanadu" },
        { hex: "#f9ce1d", name: "yellow" },
        { hex: "#365314", name: "zucchini" },
    ];

    /** If no index, return all sorted alphabetically by name */
    if (!index) {
        return colors.sort((a, b) => a.name.localeCompare(b.name));
    }

    /** Normalize strings: trim spaces and lowercase */
    const cleaned = index.map((s) => s.trim().toLowerCase());

    /** Filter colors by full name match or first letter match */
    const filtered = colors.filter(
        (c) =>
            cleaned.includes(c.name) ||
            cleaned.some((l) => c.name.startsWith(l))
    );

    /** Return filtered if exists, else first color as fallback */
    return filtered.length ? filtered : [colors[0]];
};

/**
 * Generate a series of color fusion variations from a base HEX color.
 *
 * This function produces lighter and darker blended shades around the
 * given base color. It returns an array of HEX values representing
 * evenly distributed fusion steps.
 *
 * @function generateColorFusions
 * @param {string} baseHex - The starting hex color code (e.g., "#f58520" or "f58520").
 * @param {number} [round=5] - How many fusion steps to generate in each direction
 * (lighter and darker). The total returned colors will be `round * 2 + 1`.
 *
 * @returns {string[]} Array of HEX color codes representing generated color fusions,
 * including the original base color centered in the sequence.
 *
 * @example
 * Generate 5 lighter and 5 darker variations around #f58520
 * const palette = generateColorFusions("#f58520", 5);
 * ["#c46a1a", "#d1721d", ..., "#f58520", ..., "#ff9950", "#ffb27d"]
 *
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const generateColorFusions = (baseHex, round = 5) => {
    /* Convert hex to RGB */
    function hexToRgb(hex) {
        hex = hex.replace(/^#/, "");
        const int = parseInt(hex, 16);
        return {
            r: (int >> 16) & 255,
            g: (int >> 8) & 255,
            b: int & 255,
        };
    }

    /* RGB to HSL */
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = d / (1 - Math.abs(2 * l - 1));

            switch (max) {
                case r:
                    h = ((g - b) / d) % 6;
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
            if (h < 0) h += 1;
        }

        return { h, s, l };
    }

    /* HSL to HEX */
    function hslToHex(h, s, l) {
        const a = s * Math.min(l, 1 - l);

        const f = (n) => {
            const k = (n + h * 12) % 12;
            const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
            return Math.round(255 * c)
                .toString(16)
                .padStart(2, "0");
        };

        return `#${f(0)}${f(8)}${f(4)}`;
    }

    const { r, g, b } = hexToRgb(baseHex);
    let { h, s, l } = rgbToHsl(r, g, b);

    const results = [];

    for (let i = 0; i < round; i++) {
        /* Smooth perceptual fusion curve (instead of linear) */
        const t = i / (round - 1);
        const factor = Math.sin((t - 0.5) * Math.PI) * 0.5; // -0.5 → +0.5

        /* Adaptive color scaling */
        const adaptiveS = s * (1 + factor * 0.4); // soften extremes
        const adaptiveL = l * (1 + factor * 0.35); // smooth yellow/orange

        /* Clamp */
        const newS = Math.min(1, Math.max(0, adaptiveS));
        const newL = Math.min(1, Math.max(0, adaptiveL));

        results.push(hslToHex(h, newS, newL));
    }

    return results;
};

/**
 * Capitalizes first letter and lowercases the rest of the string
 *
 * @method capitalizeFirst
 * @description Converts first character to uppercase and all others to lowercase
 *
 * @param {string} str - Input string
 * @returns {string} Formatted string
 *
 * @example
 * capitalizeFirst("hello WORLD") // → "Hello world"
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
