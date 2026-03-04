import React from "react";
import IconComponent from "@/Components/IconComponent";

/**
 * @component
 * ListContainerComponent
 *
 * @description
 * A modern, clean, and highly readable list component for displaying key-value pairs.
 * Ideal for user profiles, account details, settings, contact information, or status overviews.
 * Features:
 * - Full justify-between layout for perfect alignment
 * - Optional icons with subtle background tint
 * - Smooth hover effects and dividers for better visual separation
 * - Responsive design with comfortable spacing
 * - Accessible and professional UI using DaisyUI/Tailwind best practices
 *
 * Props:
 * - data: Array of objects with structure:
 *   {
 *     key: string (required - unique identifier),
 *     label: string (display label),
 *     value: string|number|ReactNode (display value),
 *     icon: string (icon name passed to IconComponent)
 *   }
 * - showIcon: boolean - Whether to display icons. Default: true
 *
 * @param {Object} props
 * @param {Array} props.data - Items to render in the list
 * @param {boolean} [props.showIcon=true] - Toggle icon visibility
 * @returns {JSX.Element}
 *
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */

export default function ListContainerComponent({
    data = [],
    showIcon = true,
}) {
    if (data.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            <ul className="bg-base-100 rounded-md shadow-lg divide-y divide-base-300 overflow-auto">
                {data.map((item) => (
                    <li
                        key={item.key}
                        className="
                            flex flex-col gap-2
                            sm:flex-row sm:items-center 
                            sm:px-2 px-1 py-3
                            hover:bg-base-200 transition-colors duration-150
                        "
                    >
                        {/* Left: Icon + Label */}
                        <div className="flex items-center gap-1">
                            {showIcon && item.icon && (
                                <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-transparent flex items-center justify-center text-primary flex-shrink-0 border-0 border-base-content/50">
                                    <IconComponent
                                        icon={item.icon}
                                        classList="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                                    />
                                </div>
                            )}

                            <div className="sm:text-sm text-base text-base-content/70 font-medium min-w-16">
                                {item.label}
                            </div>
                        </div>

                        {/* Right: Value – Safely support both HTML strings and React nodes */}
                        <div className="text-base-content/60 break-words flex flex-wrap items-center gap-2 sm:ml-auto sm:text-right sm:text-base text-sm ">
                            {typeof item.value === "string" ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: item.value,
                                    }}
                                />
                            ) : (
                                item.value || "-" 
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
