import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";
/**
 * TwGeneralFormTextarea Component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TwGeneralFormTextarea({
    label = "",
    info = "default",
    placeholder = "",
    required = false,
    icon = "",
    error = "",
    value = "",
    onChange = () => {},
    name = "",
    rows = 3,
    classColSpan = "col-span-full",
}) {
    const __ = useTranslations();

    return (
        <fieldset className={`w-full ${classColSpan}`}>
            {label && (
                <legend className="text-sm font-medium text-base-content mb-1">
                    {__(label)}
                </legend>
            )}

            <label
                className={`flex items-start gap-2 w-full border rounded-md transition-colors
                    ${error ? "border-error" : "border-base-300"}
                    focus-within:ring-2 focus-within:ring-brandColor/30 focus-within:border-brandColor`}
            >
                {icon && (
                    <div className="flex items-start pt-2 pl-2">
                        <IconComponent
                            icon={icon}
                            classList={`text-base-content/60 ${
                                required ? "text-lg" : "text-md"
                            }`}
                        />
                    </div>
                )}

                <textarea
                    name={name}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    className="w-full h-full px-2 py-2 text-sm bg-transparent outline-none resize-none text-base-content placeholder:text-base-content/60"
                ></textarea>

                {required && (
                    <div className="flex items-start pt-2 pr-2">
                        <RequiredIconComponent title="Required" />
                    </div>
                )}
            </label>

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
