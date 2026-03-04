import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * DataNotFoundComponent
 *
 * A reusable UI component for displaying a "no data found" message.
 * Supports both table and non-table contexts.
 *
 * ## Features:
 * - Displays a translated "no data found" message.
 * - Works inside table rows using `<tr><td>` or as standalone inline text.
 * - Customizable label, styling, and colspan.
 *
 * @param {Object} props
 * @param {string} [props.label="No data found"] - The text label to display.
 * @param {string} [props.className="px-6 py-4 text-center text-gray-500"] - CSS classes for styling.
 * @param {number|string} [props.colspan=4] - The `colSpan` value when used inside a table.
 * @param {boolean} [props.isTable=false] - Whether to render inside a table row (`<tr><td>`).
 *
 * @returns {JSX.Element} Rendered "no data found" message, either inline or inside a table row.
 */
export default function DataNotFoundComponent({
    label = "No data found",
    className = "px-6 py-4 text-center text-gray-500",
    colspan = "4",
    isTable = false,
}) {
    const __ = useTranslations();

    const content = (
        <del className="text-brandColor text-xs italic">{__(label)}</del>
    );

    if (isTable) {
        return (
            <tr>
                <td colSpan={colspan} className={className}>
                    {label}
                </td>
            </tr>
        );
    }

    return content;
}
