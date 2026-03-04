import React from "react";
import IconComponent from "@/Components/IconComponent";
import { usePage, Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import { useRoute } from "ziggy";

export default function FilterResetButtonComponent({
    icon = "refresh",
    className = "flex justify-center py-3 border-gray-200",
    iconClass = "base-100 h-4 w-4",
    link = "",
    title = "Reset",
}) {
    const __ = useTranslations();
    const route = useRoute();
    const { tenant } = usePage().props;
    return (
        <Link
            href={route(link, { tenant })}
            title={__(title)}
            className={className}
        >
            <IconComponent icon={icon} classList={iconClass} />
        </Link>
    );
}
