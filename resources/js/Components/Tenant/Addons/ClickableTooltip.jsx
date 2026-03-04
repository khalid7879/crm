import React from "react";

export default function ClickableTooltip({
    position = "top",
    onClose,
    children,
    isOpen,
    onOpen,
    showTooltip = true,
}) {
    const handleChoice = (choice) => {
        if (onClose) onClose(choice);
    };

    return (
        <div className="relative inline-block w-full">
            {/* Trigger element */}
            <div
                onClick={showTooltip ? onOpen : null}
                className="w-full cursor-pointer"
            >
                {children}
            </div>

            {/* Tooltip */}
            {isOpen && (
                <div
                    className={`absolute z-20 bg-white border border-gray-300 shadow-lg rounded-md p-2
                        ${
                            position === "top"
                                ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
                                : ""
                        }
                        ${
                            position === "bottom"
                                ? "top-full left-1/2 -translate-x-1/2 mt-2"
                                : ""
                        }
                        ${
                            position === "left"
                                ? "right-full top-1/2 -translate-y-1/2 mr-2"
                                : ""
                        }
                        ${
                            position === "right"
                                ? "left-full top-1/2 -translate-y-1/2 ml-2"
                                : ""
                        }`}
                >
                    {/* Arrow */}
                    <div
                        className={`absolute w-3 h-3 bg-white border-3 border-brandColor rotate-45
                            ${
                                position === "top"
                                    ? "left-1/2 -translate-x-1/2 top-full -mt-[6px]"
                                    : ""
                            }
                            ${
                                position === "bottom"
                                    ? "left-1/2 -translate-x-1/2 bottom-full -mb-[6px]"
                                    : ""
                            }
                            ${
                                position === "left"
                                    ? "top-1/2 -translate-y-1/2 left-full -ml-[6px]"
                                    : ""
                            }
                            ${
                                position === "right"
                                    ? "top-1/2 -translate-y-1/2 right-full -mr-[6px]"
                                    : ""
                            }`}
                    />

                    {/* Buttons */}
                    <div className="flex gap-2 justify-center">
                        <button
                            className="btn btn-xs btn-error text-white"
                            onClick={() => handleChoice("no")}
                        >
                            No
                        </button>
                        <button
                            className="btn btn-xs btn-success text-white"
                            onClick={() => handleChoice("yes")}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
