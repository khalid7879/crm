import React from "react";
import { Link } from "@inertiajs/react";
import { getIcon } from "@/utils/icons";
import { colorMap, sizeMap } from "@/utils/common/helpers";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * IconComponent
 *
 * Renders an icon with optional tooltip, link, size, and color customization.
 *
 * @param {Object} props
 * @param {string} props.icon - The icon name to render (from getIcon utility)
 * @param {string} [props.tooltip] - Tooltip text displayed on hover (DaisyUI tooltip)
 * @param {string} [props.link] - Optional URL to wrap the icon in a link
 * @param {string} [props.color="baseContent"] - Color of the icon (from colorMap)
 * @param {string} [props.size="2xl"] - Size of the icon (from sizeMap)
 * @param {string} [props.classList] - Additional custom CSS classes
 *
 * @returns {JSX.Element|null} The rendered icon element or null if icon is invalid
 *
 * @import IconComponent from "@/Components/IconComponent"
 *
 * @example
 * <IconComponent icon="user" tooltip="User profile" color="primary" size="lg" link="/profile" />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function IconComponent({
    icon,
    tooltip = "",
    link = "",
    color = "",
    size = "",
    classList = "",
    pointer = true,
    callback = undefined,
}) {
    const __ = useTranslations();
    const IconElement = getIcon(icon);

    if (!IconElement) return null;

    const sizeClass = sizeMap[size] ? `text-${sizeMap[size]}` : `text-md`;
    const colorClass = colorMap[color]
        ? `text-${colorMap[color]}`
        : `text-base-content/50`;

    const iconNode = (
        <div
            className={`tooltip ${pointer ? "cursor-pointer" : ""}`}
            data-tip={__(tooltip)}
        >
            <IconElement
                className={`${sizeClass} ${colorClass} ${classList}`}
                onClick={callback}
            />
        </div>
    );

    return link ? <Link href={link}>{iconNode}</Link> : iconNode;
}
