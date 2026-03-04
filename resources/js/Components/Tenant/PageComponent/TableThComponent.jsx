import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
/**
 * TableComponent component
 *
 * @param props object
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TableThComponent({
    label = "",
    positionClass = "text-left",
}) {
    const __ = useTranslations();

    return (
        <th
            className={`px-4 py-2 text-sm font-semibold ${positionClass} whitespace-nowrap 
                bg-base-200 text-base-content 
                dark:bg-base-300 dark:text-base-content`}
        >
            {__(label)}
        </th>
    );
}
