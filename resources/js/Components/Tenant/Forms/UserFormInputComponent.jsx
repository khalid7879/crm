import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component
 * A reusable form input component that supports various field types (text, textarea, select, date, etc.).
 * Handles value binding, change events, error display, readonly state, and translation for labels/notes.
 *
 * @description
 * This component dynamically renders appropriate input elements based on the provided field configuration.
 * It ensures consistent styling, error handling, and accessibility across different input types while
 * maintaining full feature parity with the original implementation.
 *
 * Features preserved:
 * - Support for text, textarea, select, date, and other input types
 * - Translation support via useTranslations hook
 * - Error message display
 * - Readonly mode
 * - Custom className and gridSize support
 * - Proper value handling for array-wrapped values (backward compatibility)
 * - Placeholder, required, and autoComplete attributes
 *
 * Optimizations applied:
 * - Reduced redundant code by unifying input rendering logic
 * - Improved className composition using template literals and conditional logic
 * - Removed unused IconComponent import
 * - Cleaner error rendering with consistent styling
 * - Better variable naming and structure for readability
 *
 * @param {Object} props
 * @param {Object} props.data - Form data object
 * @param {Function} props.handleChange - Legacy change handler (kept for compatibility, unused internally)
 * @param {Object} props.errors - Validation errors object
 * @param {boolean} props.isReadonly - Whether the field is readonly
 * @param {Object} props.field - Field configuration (name, label, type, options, etc.)
 * @param {Function} props.setData - Function to update form data
 * @param {string} [props.className] - Additional CSS classes for the input element
 * @returns {JSX.Element}
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function UserFormInputComponent({
    data = {},
    handleChange = () => {},
    errors = {},
    isReadonly = false,
    field,
    setData,
    classList = "",
}) {
    const __ = useTranslations();

    if (!field) return null;

    const fieldName = field.name;
    const rawValue = data[fieldName];
    let value = Array.isArray(rawValue)
        ? rawValue
        : rawValue || (field.type === "checkbox-group" ? [] : "");

    const label = __(field.label);
    const hasError = !!errors[fieldName];
    const errorMessage = errors[fieldName];

    const isTextarea = field.type === "textarea";
    const isSelect = field.type === "select";
    const isCheckboxGroup = field.type === "checkbox-group";

    const isSwitch = field.type === "switch";

    /* Base classes for wrapper (supports full colspan if needed) */
    const wrapperClass = `relative ${field.gridSize ? "col-span-full" : ""}`;

    /* Shared input classes with error/accent states */
    const baseInputClass = `${classList} text-base-content/75 placeholder:text-base-content/50 w-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brandColor/50 rounded-md`;
    const statusClass = hasError
        ? "border-red-500 focus:border-brandColor"
        : "border-base-content/30 focus:border-brandColor/50";

    const handleCheckboxChange = (optValue, checked) => {
        if (isReadonly) return;
        const newValue = checked
            ? [...value, optValue]
            : value.filter((v) => v !== optValue);
        setData(fieldName, newValue);
    };

    const renderTextarea = () => {
        return (
            <textarea
                id={field.id || fieldName}
                name={fieldName}
                value={value}
                readOnly={isReadonly}
                onChange={(e) =>
                    !isReadonly && setData(fieldName, e.target.value)
                }
                placeholder={
                    field.placeholder ? __(field.placeholder) : undefined
                }
                required={!!field.required}
                className={`${baseInputClass} ${statusClass} min-h-[100px]`}
            />
        );
    };

    const renderInput = () => {
        if (isSwitch) {
            return (
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        id={field?.id || fieldName}
                        name={fieldName}
                        className="toggle toggle-success"
                        checked={value || false}
                        onChange={(e) =>
                            !isReadonly && setData(fieldName, e.target.checked)
                        }
                        disabled={isReadonly}
                    />
                    <span className="text-sm text-base-content/70">
                        {value ? __("Active") : __("Inactive")}
                    </span>
                </label>
            );
        }
        if (isCheckboxGroup) {
            return (
                <div
                    className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-hidden `}
                >
                    {field.options?.map((option, index) => (
                        <fieldset
                            key={`${fieldName}_${index}`}
                            className="fieldset bg-base-100 border border-base-content/30  rounded-box w-full p-3 py-2"
                        >
                            <label className="label flex items-center cursor-pointer">
                                <input
                                    name={`${fieldName}_${index}`}
                                    type="checkbox"
                                    className="checkbox mr-2 border-brandColor/50 shrink-0"
                                    checked={value.includes(option.optValue)}
                                    onChange={(e) =>
                                        handleCheckboxChange(
                                            option.optValue,
                                            e.target.checked
                                        )
                                    }
                                    disabled={isReadonly || !!option.isDisabled}
                                />
                                <span className="flex-1 min-w-0 text-sm sm:text-base lg:text-sm text-base-content/75  break-words">
                                    {__(option.optLabel)}
                                </span>
                            </label>
                        </fieldset>
                    ))}
                </div>
            );
        }

        if (isSelect) {
            return (
                <select
                    id={field.id || fieldName}
                    name={fieldName}
                    value={value}
                    disabled={isReadonly}
                    onChange={(e) =>
                        !isReadonly && setData(fieldName, e.target.value)
                    }
                    className={`${baseInputClass} ${statusClass}`}
                >
                    {field.options?.map((option, index) => (
                        <option
                            key={`${fieldName}_${index}`}
                            value={option.optValue}
                            disabled={!!option.isDisabled}
                        >
                            {__(option.optLabel)}
                        </option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={field.type || "text"}
                id={field.id || fieldName}
                name={fieldName}
                placeholder={
                    field.placeholder ? __(field.placeholder) : undefined
                }
                required={!!field.required}
                autoComplete={field.autoCompleteAttr}
                value={value}
                readOnly={isReadonly}
                onChange={(e) =>
                    !isReadonly && setData(fieldName, e.target.value)
                }
                className={`${baseInputClass} ${statusClass}`}
            />
        );
    };

    return (
        <div className={wrapperClass}>
            <label className="block text-sm font-medium text-base-content/70 mb-1">
                {label}
                {field.required && (
                    <span className="text-brandColor ml-1">*</span>
                )}
            </label>

            {isTextarea ? renderTextarea() : renderInput()}

            {field.note && (
                <p className="text-xs text-gray-500 mt-1">{__(field.note)}</p>
            )}

            {hasError && (
                <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
            )}
        </div>
    );
}
