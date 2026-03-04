import React from "react";
import Select from "react-select";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";

/**
 * RsSelectableComponent Component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function RsSelectableComponent({
    options = [],
    onChange,
    value = [],
    placeholder = "",
    required = false,
    label = "",
    info = "default",
    error = "",
    icon = "user",
    classColSpan = "",
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
                    focus-within:ring-2 focus-within:ring-brandColor/40 focus-within:border-brandColor min-h-[3rem]
                    dark:border-base-300 dark:text-base-content dark:focus-within:ring-brandColor`}
            >
                <IconComponent
                    icon={icon}
                    classList={`text-base-content/60 ${
                        required ? "text-lg" : "text-md"
                    } ml-2`}
                />

                <div className="flex-1 min-w-0">
                    <Select
                        isMulti
                        options={options}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        menuPlacement="auto"
                        className="react-select-container text-base-content dark:text-base-content"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base, state) => ({
                                ...base,
                                backgroundColor: "transparent",
                                border: "none",
                                boxShadow: state.isFocused
                                    ? "0 0 0 2px var(--p)"
                                    : "none",
                                minHeight: "3rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }),
                            valueContainer: (base) => ({
                                ...base,
                                padding: "0.25rem 0.5rem",
                            }),
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: "#f58520",
                                // backgroundColor: "#fff",
                                color: "black",
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                color: "black",
                            }),
                            input: (base) => ({
                                ...base,
                                color: "inherit",
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused
                                    ? "#f58510"
                                    : "#fff",
                                color: "#101010",
                                cursor: "pointer",
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
