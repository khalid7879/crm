import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import IconComponent from "@/Components/IconComponent";

export default function CommonTdComponent({
    label = 0,
    icon = "star",
    positionClass = "text-left",
}) {
    const __ = useTranslations();
    const totalStars = 5;

    return (
        <td
            className={`flex items-center justify-center px-3 py-2 whitespace-nowrap text-sm text-gray-500 font-normal ${positionClass}`}
        >
            {Array.from({ length: totalStars }).map((_, index) => (
                <IconComponent
                    key={index}
                    icon={icon}
                    classList={`text-xl ${
                        index < Number(label) ? "text-brandColor" : "text-gray-300"
                    }`}
                />
            ))}
        </td>
    );
}
