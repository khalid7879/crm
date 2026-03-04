import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { colorMap, sizeMap } from "@/utils/common/helpers";

/**
 * SectionHeadingComponent
 *
 * @param {string} classList - Additional custom styling
 * @param {string} heading - Text to display
 * @param {string} textSize - Text size (sm, md, lg, xl, 2xl)
 * @param {string} textColor - DaisyUI color (primary, secondary, accent, neutral, info, success, warning, error, gray5, etc.)
 * @param {boolean} hasBorder - Whether to show bottom border (default: true)
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export default function SectionHeadingComponent({
    classList = "",
    heading,
    textSize = "md",
    textColor = "gray5",
    hasBorder = true,
}) {
    const __ = useTranslations();

    const borderClass = hasBorder ? `border-b border-${colorMap["base3"]}` : "";

    return (
        <h2
            className={`font-semibold px-0 pb-1 ${borderClass} text-${sizeMap[textSize]} text-${colorMap[textColor]} ${classList}`}
        >
            {__(heading)}
        </h2>
    );
}
