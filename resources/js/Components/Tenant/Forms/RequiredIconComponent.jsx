import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

export default function RequiredIconComponent({
    title = "",
    sizeClass = "text-xl",
}) {
    const __ = useTranslations();

    return (
        <IconComponent
            title={title ? __(title) : ""}
            icon="star"
            classList={`text-brandColor ${sizeClass}`}
        />
    );
}
