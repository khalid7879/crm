import React from "react";
import IconComponent from "@/Components/IconComponent";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";
import { useTranslations } from "@/hooks/useTranslations";
/**
 * TwGeneralFormDatalist Component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TwGeneralFormDatalist({
    label = "",
    info = "",
    placeholder = "",
    required = false,
    type = "text",
    icon = "user",
    error = "",
    value = "",
    onChange = () => {},
    name = "",
    options = {},
    datalistId = "",
    classColSpan = "",
}) {
    const __ = useTranslations();
    const resolvedDatalistId = datalistId || `${name}-datalist`;

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

                {/* Input with datalist */}
                <input
                    type={type}
                    name={name}
                    list={resolvedDatalistId}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="input input-sm flex-1 border-0 focus:outline-none focus:ring-0 
                               bg-transparent text-sm text-base-content"
                />

                {required && <RequiredIconComponent title="Required" />}
            </label>

            {/* Datalist options */}
            <datalist id={resolvedDatalistId}>
                {Object.entries(options).map(([key, label]) => (
                    <option key={key} value={label} />
                ))}
            </datalist>

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
