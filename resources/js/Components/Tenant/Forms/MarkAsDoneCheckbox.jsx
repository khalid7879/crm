import React from "react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * MarkAsDoneCheckbox Component
 *
 * A reusable checkbox component for marking tasks as complete or incomplete.
 * The checkbox is always visually checked, but its state is determined by
 * the `progressPercent` value.
 *
 * Features:
 * - Shows tooltip text depending on whether the task is complete or not.
 * - Dynamically toggles `progressPercent` between `0` (incomplete) and `100` (complete).
 * - Calls the parent `onToggle` handler with the updated task data.
 *
 * @component
 * @example
 * <MarkAsDoneCheckbox
 *   id={task.id}
 *   progressPercent={task.progress_percent}
 *   onToggle={handelMarkAsDone}
 * />
 *
 * @param {Object} props - Component props
 * @param {string|number} props.id - Unique identifier of the task
 * @param {number} props.progressPercent - Current progress percentage (0–100)
 * @param {Function} props.onToggle - Callback function triggered on checkbox toggle
 *   - Receives an object: `{ event, data: { id, value } }`
 *   - `value` is set to `100` when marking as complete, or `0` when marking as incomplete
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function MarkAsDoneCheckbox({ id, progressPercent, onToggle }) {
    const isComplete = progressPercent === 100;
    const __ = useTranslations();

    return (
        <span
            className={`tooltip tooltip-top inline-flex items-center justify-center ${
                !isComplete ? "tooltip-success" : "tooltip-warning"
            }`}
            data-tip={
                !isComplete ? __("Mark as complete") : __("Mark as incomplete")
            }
        >
            <input
                type="checkbox"
                checked={true}
                onChange={(e) =>
                    onToggle({
                        event: e,
                        data: {
                            id,
                            value: isComplete ? 0 : 100,
                        },
                    })
                }
                className={`checkbox checkbox-sm ${
                    isComplete
                        ? "checkbox-accent text-base-100"
                        : "text-base-content/50"
                }`}
            />
        </span>
    );
}
