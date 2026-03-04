import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";

/**
 * TwGeneralFormSelect Component
 *
 * Supports:
 *  - {id: label}
 *  - {id: {id, name, label}}
 *
 * When objects are passed, prefers `label` → `name` → `id`.
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TwGeneralFormSelect({
    label = "",
    info = "default",
    placeholder = "",
    required = false,
    icon = "user",
    error = "",
    options = {},
    value = "",
    onChange = () => {},
    name = "",
    classColSpan = "",
    defaultOptText = "",
    readOnly = false,
    defaultOptionDisabled = true,
}) {
    const __ = useTranslations();

    /** Normalize options into {id: label} */
    const normalizeOptions = (input) => {
        if (!input) return {};

        /* Case 1: Already {id: label} */
        if (
            typeof input === "object" &&
            Object.values(input).every((v) => typeof v === "string")
        ) {
            return input;
        }

        /* Case 2: {id: {id, name, label}} */
        return Object.fromEntries(
            Object.entries(input).map(([id, item]) => [
                id,
                item.label || item.name || id,
            ])
        );
    };

    const normalizedOptions = normalizeOptions(options);

    return (
        <fieldset className={`w-full ${classColSpan}`}>
            {label && (
                <legend className="text-sm font-medium text-base-content mb-1">
                    {__(label)}
                </legend>
            )}

            <label
                className={`flex items-center gap-2 w-full rounded-md border transition-colors
                    ${error ? "border-error" : "border-base-300"}
                    focus-within:ring-2 focus-within:ring-brandColor/30 focus-within:border-brandColor`}
            >
                {/* Left icon */}
                <IconComponent
                    icon={icon}
                    classList={`ml-2 text-base-content/60 ${
                        required ? "text-lg" : "text-md"
                    }`}
                />

                {/* Select box */}
                <select
                    disabled={readOnly}
                    name={name}
                    required={required}
                    value={value}
                    onChange={(e) =>
                        readOnly ? e.preventDefault() : onChange(e.target.value)
                    }
                    className={`select select-sm flex-1 border-0 focus:outline-none focus:ring-0 
                         text-sm text-base-content
                        ${
                            readOnly
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-transparent"
                        }`}
                >
                    {/* Default / Placeholder */}
                    <option
                        value=""
                        disabled={defaultOptionDisabled}
                        className="bg-base-100 text-base-content"
                    >
                        {defaultOptText
                            ? __(defaultOptText)
                            : __("Select an option")}
                    </option>

                    {placeholder && (
                        <option
                            value=""
                            className="bg-base-100 text-base-content"
                        >
                            {__(placeholder)}
                        </option>
                    )}

                    {/* Render normalized options */}
                    {Object.entries(normalizedOptions).map(([key, val]) => (
                        <option
                            key={key}
                            value={key}
                            className="bg-base-100 text-base-content hover:bg-base-200"
                        >
                            {val}
                        </option>
                    ))}
                </select>

                {required && <RequiredIconComponent title="Required" />}
            </label>

            {/* Error / Info text */}
            {error ? (
                <p className="text-xs text-error mt-1">{__(error)}</p>
            ) : (
                info && (
                    <p className="text-xs text-base-content/60 mt-1">
                        {__(info)}
                    </p>
                )
            )}
        </fieldset>
    );
}
