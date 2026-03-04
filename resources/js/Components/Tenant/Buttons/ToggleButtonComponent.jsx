import React from "react";
import IconComponent from "@/Components/IconComponent";
/**
 * ToggleButtonComponent component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function ToggleButtonComponent({ icon = "bars", onClick }) {
    return (
        <div className="flex justify-center pt-4 pb-1 border-b border-base-300 bg-base-100">
            <button
                id="toggleSidebar"
                onClick={onClick}
                className="text-base-content cursor-pointer hover:text-brandColor transition-colors duration-200"
            >
                <IconComponent icon={icon} classList="w-5 h-5" />
            </button>
        </div>
    );
}
