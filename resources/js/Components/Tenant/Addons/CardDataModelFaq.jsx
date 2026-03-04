import React from "react";
import CardSimple from "@/Components/Tenant/Addons/CardSimple";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component CardDataModelFaq
 *
 * @description
 * A reusable informational card component used to display short descriptive
 * content related to data models or system concepts within the tenant area.
 * The component wraps content inside a `CardSimple` layout and applies
 * translation support to the displayed text using the `useTranslations` hook.
 *
 * Intended use cases include explanatory notes, feature descriptions,
 * or contextual guidance within CRM configuration and management pages.
 *
 * @param {Object} props
 * @param {string} props.title - Title text displayed in the card header
 * @param {React.ReactNode} props.children - Translatable descriptive content
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function CardDataModelFaq({ title, children }) {
    const __ = useTranslations();

    return (
        <CardSimple title={title} borderColor="border-info">
            <span className="text-base-content/70">{__(children)}</span>
        </CardSimple>
    );
}
