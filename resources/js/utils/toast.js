import Swal from "sweetalert2";
/**
 * Displays a lightweight, auto-dismissing toast notification using SweetAlert2.
 * Perfect for success/error/info feedback after AJAX operations, form submissions, etc.
 *
 * @function swalToast
 * @param {Object}   config                          - Toast configuration
 * @param {"success"|"error"|"warning"|"info"|"question"} [config.type="error"] - Icon type
 * @param {string}   [config.message="Successful"]   - Message shown in the toast
 * @param {number}   [config.timer=3000]             - Auto-close after milliseconds
 * @param {"top"|"top-start"|"top-end"|"center"|"center-start"|"center-end"|"bottom"|"bottom-start"|"bottom-end"}
 *           [config.position="top-end"]             - Toast position on screen
 *
 * @example
 * swalToast({ type: "success", message: "Task created successfully!" });
 * swalToast({ type: "error", message: "Something went wrong", timer: 5000 });
 *
 * @returns {void}
 */
export function swalToast({
    type = "error",
    message = "Successful",
    timer = 3000,
    position = "top-end",
} = {}) {
    const Toast = Swal.mixin({
        toast: true,
        position: position,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        },
    });
    Toast.fire({
        icon: type,
        title: message,
    });
}

/**
 * Shows a full-featured confirmation dialog (modal alert) using SweetAlert2.
 * Returns a Promise that resolves when user confirms and rejects when cancelled/closed.
 *
 * @function swalAlert
 * @param {Object}  config                                      - Alert configuration
 * @param {string}  [config.title="Are you sure?"]              - Modal title
 * @param {string}  [config.text="This action cannot be undone!"] - Supporting text
 * @param {"success"|"error"|"warning"|"info"|"question"} [config.icon="warning"] - Icon type
 * @param {string}  [config.confirmButtonText="Yes"]          - Text for confirm button
 * @param {string}  [config.cancelButtonText="Cancel"]          - Text for cancel button
 *
 * @returns {Promise<SweetAlertResult>} Promise that resolves with result object on confirm,
 *          rejects on cancel/close.
 *
 * @example
 * swalAlert({
 *   title: "Delete task?",
 *   text: "This task and all its dependencies will be permanently removed.",
 *   icon: "warning",
 *   confirmButtonText: "Delete",
 * }).then((result) => {
 *   if (result.isConfirmed) {
 *     // proceed with delete
 *   }
 * });
 */
export const swalAlert = ({
    title = "Are you sure?",
    text = "This action cannot be undone!",
    icon = "warning",
    confirmButtonText = "Yes",
    cancelButtonText = "Cancel",
}) => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText,
        cancelButtonText,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        backdrop: `
            rgba(0,0,123,0.4)
            left top
            no-repeat
        `,
    });
};
