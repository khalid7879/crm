import React from "react";
import IconComponent from "@/Components/IconComponent";
import { usePage, Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";

/***
 * AddButtonComponent
 * ------------------
 * Renders an Add button with an icon.
 * If a `link` is provided, wraps the icon in an Inertia `Link`.
 * Otherwise, renders just the icon.
 *
 * @component
 * @param {object} props
 * @param {string} [props.icon="add"] - Icon to display.
 * @param {string} [props.className="px-2 py-1 cursor-pointer rounded-md"] - Tailwind classes for the button/link wrapper.
 * @param {string} [props.iconClass="text-gray-500"] - Tailwind classes for the icon.
 * @param {string} [props.link=""] - Route name to navigate when clicked. If empty, icon is not clickable.
 * @param {string} [props.iconTitle="Add new"] - Tooltip/title for the icon.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 ***/
export default function AddButtonComponent({
    icon = "add",
    className = "px-2 py-1 cursor-pointer rounded-md",
    iconClass = "text-gray-500",
    link = "",
    iconTitle = "Add new",
}) {
    const { tenant } = usePage().props;
    const __ = useTranslations();

    /* If link is empty, just render the icon */
    if (!link) {
        return <IconComponent icon={icon} classList={iconClass} />;
    }

    /* Otherwise, wrap the icon in an Inertia Link */
    return (
        <Link
            href={route(link, { tenant })}
            className={className}
            title={__(iconTitle)}
        >
            <IconComponent icon={icon} classList={iconClass} />
        </Link>
    );
}
