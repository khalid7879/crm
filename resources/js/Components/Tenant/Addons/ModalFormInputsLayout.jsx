import React, { useState } from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import { sizeMapModal } from "@/utils/common/helpers";

/**
 * ModalFormInputsLayout Component
 *
 * A reusable modal layout component for handling form inputs inside a modal dialog.
 * Supports dynamic sizes via `sizeMapModal`, customizable header, body, and footer.
 *
 * Props:
 * - isModalOpen {boolean} : Controls modal visibility.
 * - setIsModalOpen {function} : Function to toggle modal open/close state.
 * - title {string} : Modal title text.
 * - headerIcon {string} : Icon name for the modal header.
 * - children {ReactNode} : Form inputs or any content to render inside modal body.
 * - footer {boolean} : Whether to render the footer (default: true).
 * - handleSubmit {function} : Form submit handler, receives (event, isSaveAndNew).
 * - cancelText {string} : Label for cancel button (default: "Cancel").
 * - saveText {string} : Label for save button (default: "Save").
 * - saveNewText {string} : Label for save and new button (default: "Save and new").
 * - processing {boolean} : Whether to show loading spinner on submit buttons.
 * - handleReset {function} : Reset form handler.
 * - resetFormText {string} : Label for reset form button (default: "Reset form").
 * - size {"sm"|"md"|"lg"|"xl"|"2xl"} : Modal size key mapped from sizeMapModal.
 * - modalType {"CREATE"|"DELETE"} : 'CREATE' is default modalType.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ModalFormInputsLayout({
    isModalOpen = true,
    setIsModalOpen = () => {},
    title = "Modal Title",
    headerIcon = "edit",
    children,
    footer = true,
    handleSubmit = () => {},
    cancelText = "Cancel",
    saveText = "Save",
    saveNewText = "Save and new",
    processing = () => {},
    handleReset = () => {},
    resetFormText = "Reset form",
    size = "lg",
    modalType = "CREATE",
    handleDelete = () => {},
    showSaveNewBtn = true,
    showSaveBtn = true,
    deleteIcon = "delete",
}) {
    const [saveAndNew, setSaveAndNew] = useState(false);
    const __ = useTranslations();
    if (!isModalOpen) return null;

    const onSubmit = (e, isSaveAndNew) => {
        setSaveAndNew(isSaveAndNew ? true : false);
        handleSubmit(e, isSaveAndNew);
    };

    return (
        <dialog className="modal" open>
            <div
                className={`modal-box p-0 rounded-lg bg-base-100 dark:bg-base-200 flex flex-col ${sizeMapModal[size]}`}
            >
                {/* ---------------------- Header Section ----------------------
                    Contains the modal icon, title, and close button.
                    The close button also triggers `handleReset` on exit.
                ---------------------------------------------------------------- */}
                <div className="flex items-center justify-between p-2 rounded-t-lg bg-brandColor flex-shrink-0">
                    <div className="flex items-center gap-2  text-white">
                        <IconComponent
                            icon={headerIcon}
                            size="2xl"
                            color="white"
                            classList="hidden sm:flex"
                        />
                        <h3 className="text-xl font-semibold">{__(title)}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(false);
                            handleReset();
                        }}
                        className="btn btn-ghost btn-square btn-sm text-base-100"
                        title={__(cancelText)}
                    >
                        <IconComponent
                            icon="cross"
                            classList="text-2xl p-1 text-brandColor bg-white w-5 h-5 rounded-full text-center cursor-pointer"
                        />
                    </button>
                </div>

                {/* ---------------------- Body Section ----------------------
                    Scrollable area that renders form inputs or children elements.
                ---------------------------------------------------------------- */}
                <div className="p-3 flex-1 overflow-y-auto space-y-2 bg-white">
                    {children}
                </div>

                {/* ---------------------- Footer Section ----------------------
                    Contains action buttons:
                    - Reset form (only when modalType === "CREATE")
                    - Cancel
                    - Save and New (only when modalType === "CREATE")
                    - Save / Delete (depending on modalType)

                    Layout handling:
                    - Uses two <aside> blocks:
                        1. Left side: Reset button OR empty spacer (to preserve right alignment).
                        2. Right side: Cancel + Save/SaveNew buttons.
                    - When modalType === "DELETE", the reset button is hidden,
                      but a placeholder <aside> is rendered to maintain spacing
                      so that the right-side buttons remain aligned to the right.
                ---------------------------------------------------------------- */}
                {footer && (
                    <div className="modal-action flex flex-col-reverse md:flex-row justify-between items-center gap-3 p-2 flex-shrink-0 border-t border-base-300 dark:border-base-700">
                        {modalType !== "DELETE" ? (
                            <aside className="hidden md:flex">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="btn btn-dash btn-warning btn-sm flex items-center gap-2"
                                >
                                    <IconComponent
                                        icon="reset"
                                        classList="text-sm text-brandColor"
                                    />
                                    {__(resetFormText)}
                                </button>
                            </aside>
                        ) : (
                            /** Spacer to keep right-side buttons aligned */
                            <aside className="hidden md:flex" />
                        )}

                        <aside className="flex flex-row-reverse md:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    handleReset();
                                }}
                                className="hidden md:flex btn btn-sm btn-soft items-center gap-2"
                            >
                                <IconComponent
                                    icon="crossCircle"
                                    classList="text-sm text-brandColor"
                                />
                                {__(cancelText)}
                            </button>

                            {showSaveNewBtn && (
                                <button
                                    type="button"
                                    onClick={(e) => onSubmit(e, true)}
                                    className="btn btn-sm btn-soft flex items-center gap-2"
                                >
                                    {processing && saveAndNew ? (
                                        <LoadingSpinner
                                            size="xs"
                                            color="success"
                                            showTitle={false}
                                        />
                                    ) : (
                                        <IconComponent
                                            icon="save2"
                                            classList="text-sm text-brandColor"
                                        />
                                    )}
                                    {__(saveNewText)}
                                </button>
                            )}

                            {showSaveBtn && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        if (modalType !== "DELETE") {
                                            setSaveAndNew(false);
                                            handleSubmit(e, false);
                                        } else {
                                            handleDelete(e);
                                        }
                                    }}
                                    className="btn btn-sm bg-brandColor flex items-center gap-2 text-base-100 min-w-[100px]"
                                >
                                    {processing && !saveAndNew ? (
                                        <LoadingSpinner
                                            showTitle={false}
                                            size="xs"
                                            color="success"
                                        />
                                    ) : (
                                        <IconComponent
                                            icon={`${
                                                modalType === "DELETE"
                                                    ?  deleteIcon 
                                                    : "save"
                                            }`}
                                            color="white"
                                            size="sm"
                                        />
                                    )}
                                    <span>{__(saveText)}</span>
                                </button>
                            )}
                        </aside>
                    </div>
                )}
            </div>
        </dialog>
    );
}
