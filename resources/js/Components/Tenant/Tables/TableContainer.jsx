import React from "react";

/**
 * TableContainer component
 *
 * A responsive table wrapper that enables horizontal scrolling on small screens
 * with enhanced readability features inspired by modern data table patterns.
 *
 * Features:
 * - Horizontal scroll with custom thin scrollbar (visible on hover)
 * - Responsive: uses w-max on mobile, switches to w-full on md+ screens
 * - Zebra striping and pinned rows/columns for better readability
 * - Bordered, rounded corners, and consistent background
 * - Configurable minimum width and table size
 * - Full DaisyUI integration
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Table head/body content
 * @param {string} [props.className=""] - Additional classes for the outer container
 * @param {string} [props.minWidth="1200px"] - Minimum width of the table (Tailwind arbitrary value, e.g., "1200px")
 * @param {string} [props.tableSize="sm"] - DaisyUI table size: "xs", "sm", "md", or "lg"
 *
 * @returns {JSX.Element}
 */
export default function TableContainer({
    children,
    className = "",
    minWidth = "1200px",
    tableSize = "sm",
}) {
    return (
        /** Outer wrapper for horizontal scrolling with custom scrollbar styling */
        <div
            className={`w-full overflow-x-auto dataManagementScrollbar hover:scrollbar-show ${className}`}
        >
            <table
                className={`table table-${tableSize} table-zebra table-pin-rows table-pin-cols w-max md:w-full min-w-[${minWidth}] border border-base-300 bg-base-100 rounded-lg`}
            >
                {children}
            </table>
        </div>
    );
}
