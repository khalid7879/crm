import React from "react";
import AsyncSelect from "react-select/async";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";

/**
 * RsAsyncSelectComponent Component
 *
 * @author Sakil
 */
export default function RsAsyncSelectComponent({
    value = null,
    onChange,
    loadOptions,
    placeholder = "Select...",
    isClearable = true,
    defaultOptions = true,
    isDisabled = false,
    required = false,
    label = "",
    info = "default",
    error = "",
    icon = "user",
    classColSpan = "",
    size = "md",
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
                className={`flex items-center gap-2 w-full border rounded-md transition-colors 
                    ${error ? "border-error" : "border-base-300"}
                    focus-within:ring-2 focus-within:ring-brandColor/40 focus-within:border-brandColor
                    dark:border-base-300 dark:text-base-content dark:focus-within:ring-brandColor
                    input-${size}
                `}
            >
                <IconComponent
                    icon={icon}
                    classList={`text-base-content/60 ml-2 ${
                        required ? "text-lg" : "text-md"
                    }`}
                />

                <div className="flex-1 min-w-0">
                    <AsyncSelect
                        cacheOptions
                        defaultOptions={defaultOptions}
                        loadOptions={loadOptions}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        isClearable={isClearable}
                        isDisabled={isDisabled}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        menuPlacement="auto"
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: state.isFocused
                                    ? "0 0 0 2px var(--p)"
                                    : "none",
                                minHeight: "2.5rem",
                                cursor: "pointer",
                                color: "inherit",
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: "0.25rem 0.5rem",
                                color: "inherit",
                            }),
                            singleValue: (base) => ({
                                ...base,
                                color: "inherit",
                            }),
                            input: (base) => ({
                                ...base,
                                color: "inherit",
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused
                                    ? "var(--p)" // brandColor on hover
                                    : "var(--pf)", // default option background
                                color: "#000", // text always visible
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }),
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                            }),
                        }}
                    />
                </div>

                {required && <RequiredIconComponent title="Required" />}
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
