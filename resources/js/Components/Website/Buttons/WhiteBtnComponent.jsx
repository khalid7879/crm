import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component WhiteBtnComponent
 *
 * @description
 * A reusable button component designed for "Try for free" or similar secondary call-to-action.
 * It features a white background with branded border and text, and a smooth hover effect
 * that fills with the brand color while inverting the text to white.
 * Supports internationalization via the `useTranslations` hook.
 *
 * @param {string} [data="Try crm for free"] - The translation key for the button text.
 *                                           Defaults to "Try crm for free".
 * @param {boolean} [isBtnBlock=false] - If true, the button will expand to full width (block level).
 *
 * @returns {JSX.Element} A styled button element with translated text.
 *
 * @example
 * -- Basic usage (inline button with default text)
 * <WhiteBtnComponent />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function WhiteBtnComponent({
    data = "Try crm for free",
    isBtnBlock = false,
}) {
    const __ = useTranslations();

    return (
        <button
            className={`px-3 lg:px-6 py-1 lg:py-3 text-sm lg:text-md  font-medium rounded-md text-brandColor hover:text-white bg-base-200 hover:bg-orange-600 transition duration-300 cursor-pointer ${
                isBtnBlock ? "w-full block" : "inline-block"
            }`}
        >
            {__(data)}
        </button>
    );
}
