import React from "react";
import CardSimple from "@/Components/Tenant/Addons/CardSimple";
import { useTranslations } from "@/hooks/useTranslations";
import ListContainerComponent from "./ListContainerComponent";

/**
 * @component CardDataModelInfo
 *
 * @description
 * A reusable informational card component designed to display key details and
 * descriptive content about data models or system entities within the tenant area.
 * It wraps content in a clean `CardSimple` layout and supports full i18n translation
 * via the `useTranslations` hook.
 *
 * Ideal for use in CRM configuration pages, model overview sections, or any place
 * where contextual information about a model needs to be clearly presented.
 *
 * Features include:
 * - Model avatar placeholder
 * - Creation/updated date
 * - Modern status badge
 * - Support for additional model attributes
 * - Translatable text
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Optional translatable descriptive content
 * @param {string} [props.cardTitle="Information"] - Title of the card header
 * @param {string} [props.modelName="modelName"] - Name of the data model
 * @param {string} [props.modelCreated="modelCreated"] - Creation date/time
 * @param {string} [props.modelUpdated="modelUpdated"] - Last updated date/time
 * @param {Array<{label: string, value: string}>} [props.extraAttributes] - Optional key-value pairs to display below status
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function CardDataModelInfo({
    children,
    cardTitle = "",
    modelName = "",
    modelCreated = "",
    modelUpdated = "",
    firstLetter = {},
    extraAttributes = [],
}) {
    const __ = useTranslations();

    return (
        <CardSimple title={cardTitle}>
            {/* Model Info Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="avatar avatar-placeholder">
                    <div
                        className={`bg-[${firstLetter?.bgColor}] text-neutral-content w-16 rounded-full`}
                        style={{
                            backgroundColor: firstLetter?.bgColor || "#6b7280",
                        }}
                    >
                        <span className="text-3xl uppercase">
                            {firstLetter?.letter}
                        </span>
                    </div>
                </div>

                <div>
                    <p
                        className="font-semibold text-lg italic text-base-content/70 capitalize"
                        style={{ color: firstLetter?.bgColor || "#6b7280" }}
                    >
                        {modelName}
                    </p>
                    <div className="text-sm text-base-content/70 space-y-0.5">
                        <p>
                            {__("Created at")}: {modelCreated}
                        </p>
                        <p>
                            {__("Updated at")}: {modelUpdated}
                        </p>
                    </div>
                </div>
            </div>

            {/* Extra Attributes (if provided) */}
            {extraAttributes.length > 0 && (
                <ListContainerComponent
                    data={extraAttributes}
                ></ListContainerComponent>
            )}

            {/* Optional descriptive content */}
            {children && (
                <div className="text-sm text-gray-700 leading-relaxed">
                    {children}
                </div>
            )}
        </CardSimple>
    );
}
