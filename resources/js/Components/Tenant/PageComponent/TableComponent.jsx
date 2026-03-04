import React from "react";

/**
 * TableComponent
 *
 * A responsive table wrapper component that ensures tables are scrollable horizontally on small screens
 * while remaining full-width and styled on larger screens. Built with DaisyUI table utilities.
 *
 * Features:
 * - Horizontal scrolling with custom thin scrollbar (visible on hover)
 * - Supports DaisyUI table sizes via the `tableSize` prop
 * - Zebra striping and pinned rows for better readability
 * - Responsive behavior: uses `w-max` on mobile to allow natural table width, switches to `w-full` on md+ screens
 * - Bordered and rounded with consistent background
 *
 * Ideal for data tables that may have many columns or wide content.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Table rows and headers (<thead>, <tbody>, etc.)
 * @param {string} [props.tableSize="lg"] - DaisyUI table size variant: "xs", "sm", "md", or "lg". Defaults to "lg" for better readability on larger screens.
 *
 * @returns {JSX.Element} A responsive, styled table with horizontal scroll support on small screens
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TableComponent({ children, tableSize = "xs" }) {
    return (
        /** Outer wrapper enables horizontal scrolling when table is wider than screen */
        <div className="w-full overflow-x-auto dataManagementScrollbar hover:scrollbar-show">
            <table
                className={`table table-${tableSize} table-zebra w-max md:w-full border border-base-300 bg-base-100 rounded-lg table-pin-rows table-pin-cols`}
            >
                {children}
            </table>
        </div>
    );
}
