import React from "react";
import IconComponent from "@/Components/IconComponent";

export default function ResetFormButtonComponent({
    icon = "refresh",
    className = "p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100",
    method,
}) {
    return (
        <button
            type="button"
            onClick={method}
            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
        >
            <IconComponent icon={icon} />
        </button>
    );
}
