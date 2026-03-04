import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component
 * AlertComponent
 *
 * @description
 * A flexible and reusable Alert component built using daisyUI 5 classes.
 *
 * Displays a styled alert box with optional icon, title, subtitle, custom content, and a dismissible close button.
 * Supports all daisyUI alert variants (info, success, warning, error), style modifiers (outline, dash, soft),
 * and layout directions (vertical, horizontal).
 *
 * The component only renders if at least one of title, subTitle, or children is provided and showAlertBox is true.
 * When showCloseBtn is enabled, a close button appears in the top-right corner that calls handleShowAlertBox(false)
 * to hide the alert (controlled externally).
 *
 * @param {Object} props
 * @param {string} [props.title=""] - Main bold title of the alert. Will be translated via useTranslations.
 * @param {string} [props.subTitle=""] - Optional smaller subtitle/text below the title. Will be translated.
 * @param {string} [props.icon=""] - Icon name/key to pass to IconComponent (displayed on the left side).
 * @param {string} [props.iconClass="h-6 w-6 shrink-0"] - Additional classes for the icon element.
 * @param {"info" | "success" | "warning" | "error"} [props.type="success"] - Color variant of the alert.
 * @param {"outline" | "dash" | "soft"} [props.variant=""] - Visual style variant (e.g., alert-outline).
 * @param {"vertical" | "horizontal"} [props.direction=""] - Layout direction of the alert content.
 * @param {boolean} [props.showAlertBox=true] - Controls visibility of the alert (controlled component).
 * @param {function} [props.handleShowAlertBox=() => {}] - Callback to update showAlertBox state (called with false on close).
 * @param {boolean} [props.showCloseBtn=true] - Whether to display the dismissible close button.
 * @param {string} [props.className=""] - Additional custom classes applied to the alert container.
 * @param {React.ReactNode} [props.children] - Custom content rendered below title/subtitle (e.g., buttons, links).
 *
 * @returns {JSX.Element|null} The styled alert element or null if no content or hidden.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function AlertComponent({
    title = "",
    subTitle = "",
    type = "success",
    variant = "",
    direction = "",
    className = "",
    icon = "",
    iconClass = "h-6 w-6 shrink-0",
    showAlertBox = true,
    handleShowAlertBox = () => {},
    showCloseBtn = true,
    children,
}) {
    const __ = useTranslations();

    /* Early return if alert should not be shown or has no content */
    if ((!title && !subTitle && !children) || !showAlertBox) {
        return null;
    }

    /* Build daisyUI variant and direction classes only when provided */
    const variantClass = variant ? `alert-${variant}` : "";
    const directionClass = direction ? `alert-${direction}` : "";

    /* Base classes for the alert container */
    const baseClasses =
        `relative mb-3 alert ${variantClass} ${directionClass} ${className}`.trim();

    return (
        <div role="alert" className={baseClasses}>
            {/* Optional left-side icon */}
            {icon && (
                <IconComponent
                    icon={icon}
                    classList={`${iconClass} text-${type}`}
                />
            )}

            {/* Main content area */}
            <div className="flex-1">
                {title && (
                    <h3 className={`font-bold text-${type}`}>{__(title)}</h3>
                )}
                {subTitle && (
                    <div className={`mt-1 text-xs text-${type}`}>
                        {__(subTitle)}
                    </div>
                )}
                {children}
            </div>

            {/* Dismissible close button */}
            {showCloseBtn && (
                <button
                    onClick={() => handleShowAlertBox(false)}
                    className="btn btn-ghost btn-xs opacity-70 hover:opacity-100 absolute top-1 right-0"
                    aria-label={__("Close")}
                    title={__("Close")}
                >
                    <IconComponent
                        icon="crossCircle"
                        classList="h-5 w-5 text-brandColor"
                    />
                </button>
            )}
        </div>
    );
}
