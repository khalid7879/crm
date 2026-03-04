import React from "react";

/**
 * Reusable Dynamic Skeleton Loader Component (DaisyUI + Tailwind)
 *
 * @param {number} count - Number of skeleton blocks to render (default: 3)
 * @param {boolean} avatar - Display avatar circle skeleton in each block (default: true)
 * @param {boolean} avatarIsLeft - Avatar position (true = left, false = right)
 * @param {number} titleLines - Number of skeleton lines in the title section (default: 2)
 * @param {string[]} contentHeights - Array of Tailwind height classes for each block.
 * @param {string} gap - Vertical spacing between skeleton sections (default: "gap-4")
 * @param {string} rounded - Tailwind rounded class applied to skeleton elements (default: "rounded-md")
 * @param {boolean} showContent - Display bottom content skeleton (default: true)
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function DynamicSkeletonLoader({
    count = 3,
    avatar = true,
    avatarIsLeft = true,
    titleLines = 2,
    contentHeights = [],
    gap = "gap-4",
    rounded = "rounded-md",
    showContent = true,
}) {
    return (
        <div className="flex flex-col w-full gap-6">
            {[...Array(count)].map((_, index) => {
                const height =
                    contentHeights[index] || (index === 1 ? "h-14" : "h-24");

                return (
                    <div className={`flex flex-col w-full ${gap}`} key={index}>
                        {/* Header Section */}
                        <div className="flex items-center gap-4">
                            {/* Avatar LEFT */}
                            {avatar && avatarIsLeft && (
                                <div className="skeleton h-16 w-16 shrink-0 rounded-full" />
                            )}

                            {/* Title lines */}
                            <div className="flex flex-col gap-3 flex-1">
                                {[...Array(titleLines)].map((_, lineIndex) => (
                                    <div
                                        key={lineIndex}
                                        className={`skeleton h-4 ${
                                            lineIndex === 0 ? "w-24" : "w-36"
                                        } ${rounded}`}
                                    />
                                ))}
                            </div>

                            {/* Avatar RIGHT */}
                            {avatar && !avatarIsLeft && (
                                <div className="skeleton h-16 w-16 shrink-0 rounded-full" />
                            )}
                        </div>

                        {/* Content Section */}
                        {showContent && (
                            <div
                                className={`skeleton w-full ${height} ${rounded}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
