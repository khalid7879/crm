import React, { useState } from "react";
import CreatableSelect from "react-select/creatable";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * RsCreatableComponent Component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function RsCreatableComponent({
    label = "",
    info = "default",
    placeholder = "",
    required = false,
    icon = "tag",
    error = "",
    classColSpan = "",
    value = [],
    onChange,
}) {
    const __ = useTranslations();
    const [inputValue, setInputValue] = useState("");

    const components = {
        DropdownIndicator: null,
    };

    const createOption = (label) => ({
        label,
        value: label,
    });

    const handleKeyDown = (event) => {
        if (!inputValue) return;
        switch (event.key) {
            case "Enter":
            case "Tab":
                if (
                    value.some(
                        (option) =>
                            option.label.toLowerCase() ===
                            inputValue.toLowerCase()
                    )
                ) {
                    setInputValue("");
                    event.preventDefault();
                    return;
                }

                if (onChange) {
                    onChange([...value, createOption(inputValue)]);
                }
                setInputValue("");
                event.preventDefault();
                break;
            default:
                break;
        }
    };

    return (
        <fieldset className={`w-full ${classColSpan}`}>
            {label && (
                <legend className="text-sm font-medium text-base-content mb-1">
                    {__(label)}
                </legend>
            )}

            <div
                className={`flex w-full rounded-lg overflow-hidden border transition-colors
                    ${error ? "border-error" : "border-base-300"}
                    focus-within:ring-2 focus-within:ring-brandColor/40 focus-within:border-brandColor h-10`}
            >
                <div className="flex items-center justify-center px-3 bg-base-200 border-r border-base-300">
                    <IconComponent
                        icon={icon}
                        classList={`text-base-content/70 ${
                            required ? "text-2xl" : "text-md"
                        }`}
                    />
                </div>

                <div className="flex-1">
                    <CreatableSelect
                        components={components}
                        inputValue={inputValue}
                        isClearable
                        isMulti
                        menuIsOpen={false}
                        onChange={onChange}
                        onInputChange={(newValue) => setInputValue(newValue)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder ? __(placeholder) : ""}
                        value={value}
                        className="react-select-container text-base-content"
                        classNamePrefix="react-select"
                        styles={{
                            control: (base) => ({
                                ...base,
                                border: "none",
                                boxShadow: "none",
                                backgroundColor: "transparent",
                                minHeight: "2.5rem",
                            }),
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: "#f58520",
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
                            placeholder: (base) => ({
                                ...base,
                                color: "inherit",
                                opacity: 0.5,
                            }),
                        }}
                    />
                </div>

                {required && (
                    <div className="flex items-center px-2">
                        <span className="badge bg-brandColor text-white badge-xs">
                            {__("Required")}
                        </span>
                    </div>
                )}
            </div>

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
