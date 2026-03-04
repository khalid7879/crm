import React, { useState } from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";

/**
 * @component
 * DataFormFooterActionComponent
 *
 * @description
 * A reusable footer action bar for data forms, providing consistent Save, Save & New, Reset, and Go Back buttons.
 * Built with daisyUI/Tailwind classes for responsive layout and styling.
 *
 * Features:
 * - Primary "Save" button with optional loading spinner during processing.
 * - Optional "Save & New" button with its own loading state tracking.
 * - Optional "Reset" and "Go Back" buttons on the left side.
 * - All button texts are translatable via useTranslations hook.
 * - Buttons show only icons by default with tooltips for accessibility (text visible on larger screens if needed).
 * - Supports disabled state and processing state propagation.
 * - Allows custom children content below the main actions (e.g., additional links or notes).
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Optional additional content rendered below the main buttons.
 * @param {boolean} [props.processing=false] - Indicates if a submit action is in progress (shows spinner on active button).
 * @param {boolean} [props.disabled=false] - Globally disables all buttons (independent of processing).
 * @param {function} [props.onSubmit=() => {}] - Callback for save actions. Receives (event, isSaveAndNew).
 * @param {function} [props.onReset=() => {}] - Callback triggered on reset button click.
 * @param {function} [props.onGoBack=() => {}] - Callback triggered on go back button click.
 * @param {boolean} [props.showSaveNewBtn=false] - Whether to display the "Save & New" button.
 * @param {boolean} [props.showGoBack=true] - Whether to display the "Go Back" button.
 * @param {boolean} [props.showReset=true] - Whether to display the "Reset" button.
 * @param {string} [props.saveBtnText="Save"] - Translation key/text for the primary save button.
 * @param {string} [props.saveAndNewBtnText="Save and new"] - Translation key/text for the Save & New button.
 * @param {string} [props.resetBtnText="Reset form"] - Tooltip/translation key for reset button.
 * @param {string} [props.goBackBtnText="Go back"] - Tooltip/translation key for go back button.
 * @param {string} [props.goBackIcon="arrowLeft"] - Icon name for go back button.
 * @param {string} [props.resetIcon="refresh"] - Icon name for reset button.
 * @param {string} [props.saveIcon="save"] - Icon name for primary save button.
 * @param {string} [props.saveAndNewIcon="save2"] - Icon name for Save & New button.
 * @param {string} [props.className=""] - Additional classes for the wrapper container.
 * @param {Object} [props.buttonProps={}] - Extra props spread to all action buttons (e.g., data attributes).
 *
 * @returns {JSX.Element} The form footer action component.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function DataFormFooterActionComponent({
    children,
    processing = false,
    disabled = false,
    onSubmit = () => {},
    onReset = () => {},
    onGoBack = () => {},
    showSaveNewBtn = false,
    showGoBack = true,
    showReset = true,
    saveBtnText = "Save",
    saveAndNewBtnText = "Save and new",
    resetBtnText = "Reset form",
    goBackBtnText = "Go back",
    goBackIcon = "arrowLeft",
    resetIcon = "refresh",
    saveIcon = "save",
    saveAndNewIcon = "save2",
    className = "",
    buttonProps = {},
}) {
    const [localSaveAndNew, setLocalSaveAndNew] = useState(false);
    const __ = useTranslations();

    /* Combined disabled state: either explicitly disabled or currently processing */
    const isDisabled = disabled || processing;

    /* Reusable base button classes */
    const baseButtonClasses =
        "btn btn-sm flex items-center gap-2 px-3 py-2 justify-center";
    const primaryButtonClasses =
        "bg-brandColor text-base-100 hover:bg-brandColor/90";
    const secondaryButtonClasses =
        "btn-soft border border-base-300 hover:border-brandColor/50";
    const outlineButtonClasses =
        "btn-outline border-brandColor hover:border-brandColor";

    /* Handlers */
    const handleReset = (e) => {
        if (onReset) onReset(e);
    };

    const handleGoBack = (e) => {
        if (onGoBack) onGoBack(e);
    };

    const handleSubmit = (e, isSaveAndNew) => {
        setLocalSaveAndNew(isSaveAndNew);
        onSubmit(e, isSaveAndNew);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main action buttons row */}
            <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 w-full">
                {/* Left: Go Back & Reset */}
                <aside className="flex items-center gap-3">
                    {showGoBack && (
                        <button
                            type="button"
                            onClick={handleGoBack}
                            disabled={isDisabled}
                            className={`${baseButtonClasses} ${outlineButtonClasses} tooltip tooltip-secondary `}
                            {...buttonProps}
                            data-tip={__(goBackBtnText)}
                        >
                            <IconComponent
                                icon={goBackIcon}
                                classList="text-sm"
                            />
                        </button>
                    )}

                    {showReset && (
                        <button
                            type="reset"
                            onClick={handleReset}
                            disabled={isDisabled}
                            className={`${baseButtonClasses} ${outlineButtonClasses} tooltip tooltip-secondary`}
                            data-tip={__(resetBtnText)}
                            {...buttonProps}
                        >
                            <IconComponent
                                icon={resetIcon}
                                classList="text-sm"
                            />
                        </button>
                    )}
                </aside>

                {/* Right: Save & New + Save */}
                <aside className="flex items-center gap-3">
                    {showSaveNewBtn && (
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={isDisabled}
                            className={`${baseButtonClasses} ${secondaryButtonClasses} ${
                                processing && localSaveAndNew
                                    ? "opacity-70 cursor-not-allowed"
                                    : ""
                            }`}
                            {...buttonProps}
                        >
                            {processing && localSaveAndNew ? (
                                <LoadingSpinner
                                    size="xs"
                                    color="brand"
                                    showTitle={false}
                                />
                            ) : (
                                <IconComponent
                                    icon={saveAndNewIcon}
                                    classList="text-sm text-brandColor"
                                />
                            )}
                            {__(saveAndNewBtnText)}
                        </button>
                    )}

                    {/* Primary Save Button */}
                    <button
                        type="button"
                        onClick={(event) => handleSubmit(event, false)}
                        className={`${baseButtonClasses} ${primaryButtonClasses} ${
                            processing && !localSaveAndNew
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                        }`}
                        {...buttonProps}
                    >
                        {processing && !localSaveAndNew ? (
                            <LoadingSpinner
                                showTitle={false}
                                size="xs"
                                color="white"
                            />
                        ) : (
                            <IconComponent
                                icon={saveIcon}
                                classList="text-sm text-white"
                            />
                        )}
                        <span>{__(saveBtnText)}</span>
                    </button>
                </aside>
            </section>

            {/* Optional additional content below actions */}
            {children && (
                <section className="pt-2 border-t border-base-100 block w-full">
                    {children}
                </section>
            )}
        </div>
    );
}
