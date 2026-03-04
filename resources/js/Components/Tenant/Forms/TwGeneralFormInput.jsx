import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";

/**
 * TwGeneralFormInput Component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TwGeneralFormInput({
    label = "",
    info = "default",
    placeholder = "",
    required = false,
    type = "text",
    icon = "user",
    error = "",
    value = "",
    onChange = () => {},
    name = "",
    classColSpan = "",
    min = null,
    max = null,
    isReadOnly = false,
}) {
    const __ = useTranslations();

    const isDateType = type === "date" || type === "datetime-local";

    return (
        <fieldset className={`w-full ${classColSpan}`}>
            {label && (
                <legend className="text-sm font-medium text-base-content mb-1">
                    {__(label)}
                </legend>
            )}

            <label
                className={`flex items-center gap-2 w-full rounded-md border relative transition-colors
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

                {/* Input */}
                <input
                    readOnly={isReadOnly}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`peer input input-sm flex-1 border-0 appearance-none focus:outline-none focus:ring-0 text-sm
    ${
        isDateType
            ? value
                ? "text-base-content"
                : "text-transparent focus:text-base-content"
            : "text-base-content"
    }
    ${isReadOnly ? "bg-base-300" : "bg-transparent"}`}
                    {...(type === "number" || isDateType ? { min, max } : {})}
                />

                {/* Fake placeholder overlay for date/datetime */}
                {isDateType && !value && (
                    <span className="absolute left-10 text-sm text-base-content/50 pointer-events-none peer-focus:hidden">
                        {placeholder || (type === "date" ? __("") : __(""))}
                    </span>
                )}

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
