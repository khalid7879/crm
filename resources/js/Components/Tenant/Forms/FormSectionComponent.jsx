import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from "@inertiajs/react";
import IconComponent from "@/Components/IconComponent";

/**
 * ## FormSectionComponent
 *
 * A flexible section wrapper used in forms and dashboard views.
 * It provides an optional title, layout consistency, and a customizable
 * action button group (Save, Reset, Go Back, or modal triggers).
 *
 * ### Features:
 * - Supports localized section titles.
 * - Displays optional action buttons (Save, Reset, Go Back, Add New).
 * - Accepts child form content dynamically.
 * - Integrated with InertiaJS and `useTranslations` for i18n.
 *
 * ### Example:
 * ```jsx
 * <FormSectionComponent
 *   title="Lead Information"
 *   showActionBtns={true}
 *   handleSubmit={submitForm}
 *   handleReset={resetForm}
 *   goBackLink={route('leads.index')}
 *   submitBtnText="Save Lead"
 *   processing={isProcessing}
 * >
 *   <LeadFormFields />
 * </FormSectionComponent>
 * ```
 *
 * @component
 * @param {Object} props - React props
 * @param {string} [props.title] - The section title.
 * @param {React.ReactNode} props.children - Content rendered inside the section.
 * @param {string} [props.classList=""] - Additional CSS classes for title styling.
 * @param {string} [props.submitBtnText=""] - Text label for the submit button.
 * @param {string} [props.submitBtnActionLink=""] - URL for the submit button.
 * @param {boolean} [props.showActionBtns=false] - Whether to show the action buttons.
 * @param {function|null} [props.handleSubmit=null] - Function called when submitting.
 * @param {boolean} [props.processing=false] - Loading indicator state for submit action.
 * @param {function} [props.handleReset] - Function triggered on reset button click.
 * @param {string} [props.goBackLink=""] - Link for the "Go Back" button.
 * @param {function} [props.addNewTaskModal] - Function to open "Add new task" modal.
 * @param {string} [props.classesParentSection=""] - Additional classes for parent section.
 * @param {string} [props.iconTitle="Add new task"] - Tooltip/title for add button icon.
 *
 * @returns {JSX.Element} The rendered form section component.
 *
 * @author Sakil Jomadder<sakil.diu.cse@gmail.com>
 */
export default function FormSectionComponent({
    title,
    children,
    classList = "",
    submitBtnText = "",
    submitBtnActionLink = "",
    showActionBtns = false,
    handleSubmit = null,
    processing = false,
    handleReset,
    goBackLink = "",
    addNewTaskModal = "",
    classesParentSection = "",
    iconTitle = "Add new task",
    addLinkModal = "",
    addLinkBtn = false,
    addLinkBtnText = "Link contact",
}) {
    const __ = useTranslations();
    return (
        <section className={`bg-base-100 ${classesParentSection}`}>
            <header className="flex flex-col md:flex-row justify-between items-center border-b-1 border-b-base-300/80 pb-2">
                {title && (
                    <h2
                        className={`font-semibold text-sm text-base-content/60 px-1 ${classList}`}
                    >
                        {__(title)}
                    </h2>
                )}
                {showActionBtns && (
                    <div className="flex items-center gap-2">
                        {/* Add new task */}
                        {addNewTaskModal && (
                            <button
                                onClick={() => addNewTaskModal(true)}
                                className="btn btn-xs bg-base-300 text-base-content/50"
                            >
                                <IconComponent
                                    icon="addPlus"
                                    classList="text-sm text-brandColor"
                                />
                                {__(iconTitle)}
                            </button>
                        )}

                        {/* Go back Button */}
                        {goBackLink && (
                            <Link
                                href={goBackLink}
                                className="btn btn-xs bg-base-300 text-base-content"
                            >
                                <IconComponent
                                    icon="goBack"
                                    classList="text-sm text-brandColor"
                                />
                                {submitBtnText
                                    ? __(submitBtnText)
                                    : __("Go back")}
                            </Link>
                        )}

                        {/* Reset Button */}
                        {handleReset && (
                            <button
                                onClick={handleReset}
                                className="btn btn-xs bg-base-300 text-base-content"
                            >
                                <IconComponent
                                    icon="reset"
                                    classList="text-sm text-brandColor"
                                />
                                {submitBtnText
                                    ? __(submitBtnText)
                                    : __("Reset")}
                            </button>
                        )}

                        {/* Submit Button */}
                        {submitBtnActionLink && (
                            <Link
                                onClick={handleSubmit}
                                href={submitBtnActionLink}
                                className="btn btn-xs bg-brandColor text-white"
                            >
                                {processing ? (
                                    <span className="loading loading-spinner w-3 h-3"></span>
                                ) : (
                                    <IconComponent
                                        icon="save"
                                        classList="w-3 h-3 text-bold text-white"
                                    />
                                )}
                                {submitBtnText ? __(submitBtnText) : __("Save")}
                            </Link>
                        )}
                        {addLinkBtn && (
                            <div className="flex items-center gap-2">
                                {/* Add new task */}
                                {addLinkModal && (
                                    <button
                                        onClick={() => addLinkModal(true)}
                                        className="btn btn-xs bg-base-300 text-base-content/50"
                                    >
                                        <IconComponent
                                            icon="addPlus"
                                            classList="text-sm text-brandColor"
                                        />
                                        {__(addLinkBtnText)}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </header>
            {children}
        </section>
    );
}
