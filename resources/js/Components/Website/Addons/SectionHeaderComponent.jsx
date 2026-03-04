import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component SectionHeaderComponent
 *
 * @description
 * A reusable section header component that displays a centered heading and an optional descriptive paragraph.
 * It uses the custom `useTranslations` hook to support internationalization (i18n) for both the heading and info text.
 * The component is fully responsive and follows the design system with Tailwind CSS utility classes.
 *
 * @param {Object} props
 * @param {string} [props.sectionHeading=""] - Translation key for the main heading (h2).
 * @param {string} [props.sectionInfo=""]    - Translation key for the descriptive paragraph (p).
 *
 * @returns {JSX.Element} A centered header element with heading and paragraph.
 *
 * @example
 * <SectionHeaderComponent
 *   sectionHeading="about.title"
 *   sectionInfo="about.description"
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function SectionHeaderComponent({
    sectionHeading = "",
    sectionInfo = "",
}) {
    const __ = useTranslations();

    return (
        <header className="mb-12 px-3">
            {/* Mobile-only visual wrapper */}
            <div
                className="
                    text-center
                    border border-base-content/10
                    rounded-xl
                    bg-base-200/40
                    px-4 py-6
                    md:border-0 md:bg-transparent md:p-0
                "
            >
                <h2 className="text-2xl md:text-5xl/snug font-light text-base-content/70 mb-4 mx-auto w-full max-w-5xl">
                    {__(sectionHeading)}
                </h2>

                <p className="text-sm text-base-content/70 max-w-3xl mx-auto">
                    {__(sectionInfo)}
                </p>
            </div>
        </header>
    );
}
