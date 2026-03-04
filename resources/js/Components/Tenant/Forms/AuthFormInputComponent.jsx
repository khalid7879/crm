import React, { useState } from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component AuthFormInputComponent
 *
 * @description
 * A fully responsive authentication form input component built with DaisyUI 5 and Tailwind CSS.
 * Renders a labeled input field with an icon, optional required indicator, and error handling.
 *
 * Features:
 * - Supports normal input or joined layout with a toggle button (primarily for password show/hide).
 * - Automatically applies error styling (red border & message) when validation errors exist.
 * - Responsive design: adapts perfectly on mobile, tablet, and desktop.
 * - Accessible: includes aria attributes and proper tooltip/aria-labels.
 * - Uses DaisyUI's form-control structure for consistent spacing and alignment.
 *
 * @param {object} props
 * @param {object} props.field - Field configuration object
 * @param {string} props.field.name - Input name attribute
 * @param {string} props.field.label - Translation key for label text
 * @param {string} props.field.type - Input type (e.g., "text", "password", "email")
 * @param {string} props.field.icon - Icon name to display in label
 * @param {boolean} [props.field.required=false] - Whether field is required
 * @param {string} [props.field.autoCompleteAttr] - Autocomplete attribute value
 * @param {object} props.data - Form data from Inertia.js useForm()
 * @param {object} props.errors - Validation errors from Inertia.js
 * @param {function} props.setData - Inertia.js setData function
 * @param {string} [props.joinBtnText=""] - If provided, renders joined button with this translation key (used for password toggle)
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function AuthFormInputComponent({
    field,
    data,
    errors,
    setData,
    joinBtnText = "",
}) {
    const __ = useTranslations();
    const hasJoin = joinBtnText.length > 0;
    const hasError = !!errors[field.name];

    /** Local state to toggle password visibility */
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    /** Dynamically switch input type for password visibility */
    const inputType =
        field.type === "password" && isPasswordVisible ? "text" : field.type;

    /** Base classes shared across all input variants */
    const inputBaseClasses =
        "input h-8 w-full bg-transparent text-gray-500 placeholder:text-gray-900 focus:outline-none";

    /** State-dependent classes: error vs neutral */
    const inputStateClasses = hasError
        ? "input-error border-error focus:border-error"
        : "input-neutral border-gray-500 focus:border-brandColor";

    return (
        <div className="form-control w-full">
            {/* Responsive Label */}
            <label className="label pb-1">
                <span className="font-medium text-gray-500 flex items-center gap-2 text-base sm:text-sm ">
                    <IconComponent
                        icon={field.icon}
                        classList="text-gray-500 w-3 h-3"
                    />
                    <span>
                        {__(field.label)}
                        {field.required && (
                            <sup
                                className="ml-1 tooltip tooltip-secondary"
                                data-tip={__("Required")}
                            >
                                <IconComponent
                                    icon="required"
                                    classList="text-brandColor text-[8px]"
                                />
                            </sup>
                        )}
                    </span>
                </span>
            </label>

            {/* Input: Joined (with toggle button) or Standalone */}
            {hasJoin ? (
                <div className="join w-full">
                    <input
                        type={inputType}
                        name={field.name}
                        className={`join-item ${inputBaseClasses} ${inputStateClasses} rounded-l-md rounded-r-none border-r-0`}
                        value={data[field.name] ?? ""}
                        onChange={(e) => setData(field.name, e.target.value)}
                        autoComplete={field.autoCompleteAttr}
                        required={field.required}
                        aria-invalid={hasError}
                        aria-label={__(field.label)}
                    />
                    <button
                        type="button"
                        className="btn btn-neutral join-item h-8 rounded-l-none tooltip tooltip-warning"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        data-tip={
                            isPasswordVisible ? __("Hide") : __(joinBtnText)
                        }
                        aria-label={
                            isPasswordVisible
                                ? __("Hide password")
                                : __("Show password")
                        }
                    >
                        <IconComponent
                            icon={isPasswordVisible ? "hide" : "view"}
                            classList="text-white w-5 h-5"
                        />
                    </button>
                </div>
            ) : (
                <input
                    type={inputType}
                    name={field.name}
                    className={`${inputBaseClasses} ${inputStateClasses} rounded-md`}
                    value={data[field.name] ?? ""}
                    onChange={(e) => setData(field.name, e.target.value)}
                    autoComplete={field.autoCompleteAttr}
                    required={field.required}
                    aria-invalid={hasError}
                    aria-label={__(field.label)}
                />
            )}

            {/* Error Message - Responsive & Visible Only on Error */}
            {hasError && (
                <label className="label pt-1">
                    <span className="label-text-alt text-error text-xs sm:text-sm">
                        {errors[field.name]}
                    </span>
                </label>
            )}
        </div>
    );
}
