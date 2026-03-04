import React from "react";

/**
 * TableCardComponent
 *
 * A responsive card wrapper designed specifically for tables and wide content that may exceed viewport width.
 * Provides a clean, styled container with built-in horizontal scrolling capabilities while preventing layout overflow.
 *
 * Features:
 * - Rounded card styling with subtle padding and background
 * - Horizontal scroll container with custom thin scrollbar (visible on hover via utility classes)
 * - Prevents horizontal overflow on the parent page
 * - Fully responsive – content scrolls horizontally only when needed
 * - Ideal for data tables, wide forms, image galleries, or any overflowing tabular content
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be wrapped (typically a <table>, grid, or flex layout that may be wider than the screen)
 *
 * @returns {JSX.Element} A card container with horizontal scrolling support
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TableCardComponent({ children }) {
    return (
        <div className="max-w-full p-3 bg-base-100 rounded-[10px] overflow-hidden">
            <div className="max-w-full overflow-x-auto scrollbar-thin-scrollbar hover:scrollbar-show">
                {children}
            </div>
        </div>
    );
}