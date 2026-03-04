import React from "react";
import { _subString } from "@/utils/common/helpers";
import { Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * TableCell
 *
 * A versatile and reusable table cell component that can render as either <td> or <th>.
 * Provides consistent styling, truncation, tooltips, optional icons/avatars, progress bars,
 * and link wrapping for data display in tables.
 *
 * Features:
 * - Dynamic tag rendering (`td` or `th`)
 * - Automatic text truncation with customizable character limit
 * - Built-in DaisyUI tooltip support on hover (with translated or custom data)
 * - Optional circular avatar image or colored letter badge
 * - Progress bar display with success styling for non-zero values
 * - Optional full-cell link wrapping via Inertia Link
 * - Flexible width control (class-based or inline style for percentage widths)
 * - Support for extra children content below the main data row
 * - Column key attribute for potential scripting or styling hooks
 *
 * Perfect for building clean, responsive, and interactive data tables.
 *
 * @component
 * @param {Object} props
 * @param {"td"|"th"} [props.as="td"] - HTML tag to render as (table cell or header)
 * @param {React.ReactNode} [props.children] - Additional content to render below the main data row
 * @param {string} [props.data] - Primary text data to display (will be truncated and tooltipped)
 * @param {string} [props.dataAsLink=""] - If provided, wraps the entire cell content in an Inertia <Link> to this href
 * @param {string} [props.width="w-32"] - Width class (e.g., "w-32") or percentage string (e.g., "20%")
 * @param {number} [props.charLimit=20] - Maximum characters to show before truncation
 * @param {string} [props.classList=""] - Additional classes for the cell/tag
 * @param {string} [props.classPosition=""] - Classes for text alignment (e.g., "text-center")
 * @param {string} [props.dataIconImg=""] - URL for avatar image (currently uses placeholder)
 * @param {Object} [props.dataIconLetter=""] - Letter badge config: { letter: string, bgColor: string }
 * @param {boolean} [props.isDataIcon=false] - Enables display of image or letter badge
 * @param {number|null} [props.progress=null] - Progress value (0–100) to show a progress bar
 * @param {string} [props.columnKey=""] - Value for data-column attribute (useful for selectors)
 * @param {string} [props.hoverData=""] - Custom tooltip text (falls back to full `data` if empty)
 * @param {boolean} [props.showTooltip=true] - Whether to enable DaisyUI tooltip on the text
 * @param {Object} [props.restProps] - Any additional props to spread onto the root tag
 *
 * @returns {JSX.Element} A styled <td> or <th> element with rich conditional content
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TableCell({
    as = "td",
    children,
    data,
    dataAsLink = "",
    width = "",
    charLimit = 20,
    classList = "",
    classPosition = "",
    dataIconImg = "",
    dataIconLetter = "",
    isDataIcon = false,
    progress = null,
    columnKey = "",
    hoverData = "",
    showTooltip = true,
    ...restProps
}) {
    const __ = useTranslations();
    const Tag = as;

    const Content = (
        <div className="flex flex-col">
            <article className="flex flex-row gap-2 items-center">
                {isDataIcon && dataIconImg && (
                    <div className="avatar">
                        <div className="mask mask-circle h-4 w-4">
                            <img
                                src="https://img.daisyui.com/images/profile/demo/5@94.webp"
                                alt="Avatar"
                            />
                        </div>
                    </div>
                )}

                {isDataIcon && dataIconLetter && dataIconLetter.letter && (
                    <span
                        className={`flex items-center justify-center min-h-4 text-[10px] font-bold text-base-100 uppercase ${
                            dataIconLetter?.letter?.length > 1
                                ? "w-auto px-1.5 rounded-sm"
                                : "w-4 rounded-full"
                        }`}
                        style={{ backgroundColor: dataIconLetter.bgColor }}
                    >
                        {dataIconLetter.letter}
                    </span>
                )}

                {progress != null && progress !== undefined && (
                    <div>
                        {Number(progress) === 0 ? (
                            <progress
                                className="progress w-20"
                                value={0}
                                max="100"
                            ></progress>
                        ) : (
                            <progress
                                className="progress progress-success w-20"
                                value={progress}
                                max="100"
                            ></progress>
                        )}
                    </div>
                )}

                <span
                    className={`text-base-content ${
                        as === "td" && showTooltip
                            ? "tooltip tooltip-secondary"
                            : ""
                    }`}
                    data-tip={
                        as === "th" ? __(data) : hoverData ? hoverData : data
                    }
                >
                    {_subString(data, charLimit)}
                </span>
            </article>

            {children}
        </div>
    );

    return (
        <Tag
            data-column={columnKey}
            className={`${
                width ? width : ""
            } ${classList} ${classPosition} overflow-visible z-50`}
            style={width?.includes("%") ? { width } : {}} // Keep % if explicitly passed
            {...restProps}
        >
            {dataAsLink ? (
                <Link href={dataAsLink}>{Content}</Link>
            ) : (
                <section>{Content}</section>
            )}
        </Tag>
    );
}
