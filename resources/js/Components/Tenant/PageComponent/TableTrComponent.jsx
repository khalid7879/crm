import React from "react";

/**
 * TableTrComponent component
 *
 * @param {children} Table cells
 * @param {className} Custom class for the row
 * @author Sakil
 */
export default function TableTrComponent({
    children,
    className = "text-sm text-base-content font-normal",
}) {
    return (
        <tr className={`w-full ${className}`}>
            {children}
        </tr>
    );
}
