import React from "react";
import CardSimple from "@/Components/Tenant/Addons/CardSimple";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";

/**
 * @component CardDataModelDelete
 *
 * @description
 * A specialized danger-zone card component designed for irreversible delete actions
 * (e.g., deleting a data model, user, or any entity). It displays a warning message
 * and a prominent red delete button. Clicking the button currently triggers a
 * "Coming soon" toast notification via swalToast – intended to be replaced with
 * actual delete logic in the future.
 *
 * The component uses CardSimple with error-themed styling to visually emphasize
 * the dangerous nature of the action. All text content is translatable via the
 * useTranslations hook.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - Optional additional content to render inside the card (currently unused but preserved for flexibility).
 * @param {string} [props.title="Danger zone"] - Title displayed in the card header.
 * @param {string} [props.infoText="Once a user is deleted, deletion cannot be undone. Please be certain before proceeding"] - Warning text shown above the button. Pass an empty string to hide it.
 * @param {string} [props.deleteBtnText="Delete"] - Text for the delete button.
 * @param {string} [props.deleteId=""] - Identifier for the entity to be deleted (intended for future use in actual delete handler).
 * @param {Function} [props.onDeleteBtnClick=() => {}] - Callback for delete action (currently unused – placeholder shows "Coming soon").
 *
 * @returns {JSX.Element}
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function CardDataModelDelete({
    children,
    title = "Danger zone",
    infoText = "Once a user is deleted, deletion cannot be undone. Please be certain before proceeding",
    deleteBtnText = "Delete",
    deleteId = "",
    onDeleteBtnClick = () => {},
}) {
    const __ = useTranslations();

    /** Currently shows a placeholder toast – replace with actual delete logic when ready */
    const handleDeleteClick = () => {
        swalToast({
            type: "error",
            message: __("Coming soon"),
        });
    };

    return (
        <CardSimple
            title={title}
            borderColor="text-red-500"
            headerTextColor="text-red-500"
        >
            {infoText && (
                <p className="text-sm text-error mb-4">{__(infoText)}</p>
            )}

            {/* Unused children prop preserved for potential future extensions */}
            {children}

            <button
                className="btn bg-red-500 btn-sm w-full text-white"
                onClick={handleDeleteClick}
            >
                {__(deleteBtnText)}
            </button>
        </CardSimple>
    );
}
