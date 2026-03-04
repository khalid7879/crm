import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

export default function CommonFormInputComponent({
    data = {},
    handleChange = () => {},
    errors = {},
    isReadonly = false,
    field,
    setData,
    className,
}) {
    const __ = useTranslations();
    const fieldName = field?.name;
    const value = data[fieldName] || "";

    const label = __(field?.label);
    const note = field?.note ? __(field.note) : "";
    const error = errors[fieldName];
    const isTextarea = field?.type === "textarea";
    const isSelect = field?.type === "select";
    const isDate = field?.type === "date";

    const wrapperClass = `fieldset border-0 p-0 m-0 ${
        field.colspan ? "col-span-full" : ""
    }`;

    const inputStatusClass = error
        ? isTextarea
            ? "textarea-error"
            : isSelect
            ? "select-error"
            : isDate
            ? "input-error"
            : "input-error"
        : isTextarea
        ? "textarea-accent"
        : isSelect
        ? "select-accent"
        : isDate
        ? "input-accent"
        : "input-accent";

    // Render Select Field
    if (isSelect) {
        return (
            <div>
                <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {__(field.label)}
                </label>
                <select
                    id={fieldName}
                    name={fieldName}
                    value={data[fieldName] || ""}
                    onChange={(e) => {
                        if (!isReadonly) {
                            setData(fieldName, e.target.value);
                        }
                    }}
                    className={className}
                >
                    {field.options?.map((option, index) => (
                        <option
                            key={`${fieldName}_${index}`}
                            value={option.optValue}
                            disabled={option.isDisabled}
                        >
                            {option.optLabel}
                        </option>
                    ))}
                </select>

                <div style={{ height: "1px", marginTop: "3px" }}>
                    {errors[field.name] && (
                        <p className="text-sm text-red-500">
                            {errors[field.name]}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Render Textarea Field
    // if (isTextarea) {
    //     return (
    //         <fieldset key={fieldName} className={wrapperClass}>
    //             <textarea
    //                 id={fieldName}
    //                 name={fieldName}
    //                 placeholder={label}
    //                 value={value}
    //                 onChange={handleChange}
    //                 readOnly={isReadonly}
    //                 className={`textarea w-full rounded-box ${inputStatusClass}`}

    //             />

    //             <p
    //                 className={`mt-0 mb-1 text-sm ${
    //                     error ? "text-error" : "text-gray-500"
    //                 }`}
    //             >
    //                 {error ? __(error) : ${__("note")}: ${note}}
    //             </p>
    //         </fieldset>
    //     );
    // }

    // Render Input Field (default)
    return (
        <div>
            <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {__(field.label)}
            </label>
            <input
                type={field.type}
                name={field.name}
                id={field.id}
                placeholder={field.placeholder}
                className={className}
                required={field.required}
                autoComplete={field.autoCompleteAttr}
                value={data[field.name]}
                onChange={(e) => setData(field.name, e.target.value)}
            />
            <div style={{ height: "1px", marginTop: "3px" }}>
                {errors[field.name] && (
                    <p className="text-sm text-red-500">{errors[field.name]}</p>
                )}
            </div>
        </div>
    );
}
