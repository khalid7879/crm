import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

export default function ButtonComponent({
    type = "button",
    icon = null,
    text = "Filter",
    className = "btn btn-sm btn-accent",
    iconClass = "base-100 h-4 w-4",
    loading = false,
    disabled = false,
    onClick,
}) {
    const __ = useTranslations();

    return (
        <button
            type={type}
            onClick={onClick}
            className={className}
            disabled={disabled || loading}
            title={__(text)}
        >
            {loading ? (
                <span className="loading loading-spinner text-accent"></span>
            ) : (
                icon && <IconComponent icon={icon} classList={iconClass} />
            )}
            <span className="ml-1">{__(text)}</span>
        </button>
    );
}
