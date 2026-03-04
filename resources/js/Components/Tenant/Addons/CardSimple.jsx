import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component CardSimple
 *
 * @description
 * A lightweight and reusable card component built with Tailwind CSS v4 and DaisyUI v5.
 * Provides a clean, bordered card layout with an optional header title, customizable colors via Tailwind classes,
 * and support for a footer component. Designed for forms, information displays, or any grouped content.
 * Colors are applied directly through class strings (defaults use DaisyUI theme variables for consistency).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content/body of the card
 * @param {string} [props.title] - Optional header title (translated via useTranslations hook)
 * @param {string} [props.borderColor="border-base-content/15"] - Border color class for card and header bottom border
 * @param {string} [props.headerBg="bg-base-300/50"] - Background class for the header
 * @param {string} [props.headerTextColor="text-base-content/50"] - Text color class for the header title
 * @param {string} [props.childTextColor="text-base-content/25"] - Text color class for the card body content
 * @param {string} [props.className=""] - Additional classes to apply to the outer card container
 * @param {React.ReactNode} [props.footerComponent=null] - Optional footer content (e.g., buttons or actions)
 *
 * @returns {JSX.Element} A styled card with optional header and footer
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function CardSimple({
    children,
    title,
    borderColor = "border-base-content/15",
    headerBg = "bg-base-300/50",
    headerTextColor = "text-base-content/50",
    childTextColor = "text-base-content/25",
    className = "",
    footerComponent = null,
}) {
    const __ = useTranslations();

    /* Avoid rendering empty card with no content */
    if (!children && !title && !footerComponent) return null;

    const hasHeader = !!title;
    const hasFooter = !!footerComponent;

    return (
        <div className={`card bg-base-100 border ${borderColor} ${className}`}>
            <div className="card-body p-0 pb-3">
                {hasHeader && (
                    <h2
                        className={`card-title border-b px-3 py-3 text-sm font-semibold ${borderColor} ${headerBg} ${headerTextColor}`}
                    >
                        {__(title)}
                    </h2>
                )}

                {/* Body content with conditional top/bottom padding for visual spacing */}
                <div
                    className={`${childTextColor} px-3 ${
                        hasHeader ? "pt-1" : ""
                    }`}
                >
                    {children}
                </div>

                {hasFooter && (
                    <footer className="border-t border-base-300 px-3 pt-3">
                        {footerComponent}
                    </footer>
                )}
            </div>
        </div>
    );
}
