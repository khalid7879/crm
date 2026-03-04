import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import RequiredIconComponent from "@/Components/Tenant/Forms/RequiredIconComponent";
import IconComponent from "@/Components/IconComponent";

export default function TwGeneralFormRadioGroup({
    name,
    label = "",
    info = "",
    legend = "",
    options = [],
    value,
    onChange,
    direction = "row",
    required = false,
    error = "",
    classColSpan = "col-span-full",
    icon = "",
}) {
    const __ = useTranslations();

    return (
        <fieldset
            className={`fieldset w-full border border-base-300 rounded-box px-2 py-1.5 relative min-h-11 ${classColSpan}`}
        >
            {legend && (
                <legend className="-mt-0 text-xs px-1 bg-base-100 flex items-center gap-1 leading-none">
                    {icon && (
                        <IconComponent
                            icon={icon}
                            classList={`text-gray-400 text-sm ml-2`}
                        />
                    )}
                    {__(legend)}
                    {required && (
                        <RequiredIconComponent
                            title="Required"
                            sizeClass="text-md"
                        />
                    )}
                </legend>
            )}

            <div
                className={`flex ${
                    direction === "col"
                        ? "flex-col gap-2"
                        : "flex-col md:flex-row gap-3"
                }`}
            >
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={option.value === value}
                            onChange={() => onChange && onChange(option.value)}
                            className="radio scale-[0.85] bg-gray-100 border-gray-300 checked:text-brandColor checked:border-brandColor"
                        />
                        <span className="text-sm">{option.label}</span>
                    </label>
                ))}
            </div>

            {error ? (
                <p className="validator-hint text-error mt-1">{__(error)}</p>
            ) : (
                info && (
                    <p className="label text-xs text-gray-500 mt-1">
                        {__(info)}
                        {required && <RequiredIconComponent title="Required" />}
                    </p>
                )
            )}
        </fieldset>
    );
}
