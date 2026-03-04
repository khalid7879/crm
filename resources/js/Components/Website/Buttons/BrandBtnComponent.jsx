import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component BrandBtnComponent
 *
 * @description
 * A reusable primary call-to-action button component with a solid brand-colored background.
 * Designed for prominent actions such as "Get a demo" or similar. It uses the translation hook
 * (`useTranslations`) for internationalization support. The button features a filled background
 * with white text, smooth hover transition to a darker orange shade, and modern rounded styling.
 *
 * @param {string} [data="Get a demo"] - The translation key for the button text.
 *                                      Defaults to "Get a demo".
 * @param {boolean} [isBtnBlock=false] - If true, the button will expand to full width (block level).
 *
 * @returns {JSX.Element} A styled primary button element with translated text.
 *
 * @example
 * -- Basic usage (inline button with default text)
 * <BrandBtnComponent />
 *
 * -- Custom translation key
 * <BrandBtnComponent data="custom.get_demo_key" />
 *
 * -- Full-width (block) button
 * <BrandBtnComponent isBtnBlock={true} />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function BrandBtnComponent({
    data = "Get a demo",
    isBtnBlock = false,
}) {
    const __ = useTranslations();

    return (
        <button
            className={`px-3 lg:px-6 py-1 lg:py-3 border border-transparent text-sm lg:text-md font-medium rounded-md text-white bg-brandColor hover:bg-orange-600 transition duration-300 cursor-pointer ${
                isBtnBlock ? "w-full block" : "inline-block"
            }`}
        >
            {__(data)}
        </button>
    );
}
