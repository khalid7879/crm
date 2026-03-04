import React from "react";
import IconComponent from "@/Components/IconComponent";
import { usePage, Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * @component
 * TableTdComponent
 *
 * A reusable and highly configurable table cell (<td>) component for data tables in admin panels and CRUD interfaces.
 * Dynamically renders content based on props, supporting actions, toggles, avatars, and sortable rows.
 *
 * Features:
 * - Action buttons (Edit, Delete, Custom) with Inertia.js links or callback methods
 * - Status toggle switch with active/inactive label
 * - "Default" and "Final Stage" checkboxes
 * - Icon or letter-based avatar with clickable label
 * - Truncated text with optional DaisyUI tooltip
 * - Row reordering arrows (up/down) based on position
 * - Full i18n support via useTranslations hook
 * - Tailwind/DaisyUI styled, responsive, and accessible
 *
 * @component
 * @param {Object} props
 * @param {string} [props.label=""] - Main display text
 * @param {string} [props.tdIcon=""] - Icon name to show before label (if no special renderer is used)
 * @param {string} [props.classList=""] - Additional classes for the <td>
 * @param {Object|Object[]} [props.action=null] - Action buttons config: { name: "EDIT"|"DELETE"|"COMMON", link?, params?, method?, icon?, title? }
 * @param {string} [props.iconClass="h-4 w-4 cursor-pointer"] - Classes for action and order icons
 * @param {any} [props.value=""] - ID/value passed to actions or routes
 * @param {boolean|number|string} [props.isDelete=false] - If true/item is protected, affects delete icon and disables status switch
 * @param {boolean|number} [props.isActive=false] - Current status for toggle switch (1 = active)
 * @param {string} [props.editIcon="edit"] - Default edit icon name
 * @param {string} [props.deleteIcon="delete"] - Default delete icon name
 * @param {string} [props.notDeleteIcon="notDelete"] - Icon when deletion is disabled
 * @param {string} [props.title=""] - Fallback tooltip/title for custom actions
 * @param {function} [props.statusMethod] - Handler for status toggle change
 * @param {function} [props.defaultMethod] - Handler for "Default" checkbox
 * @param {function} [props.finalStageMethod] - Handler for "Final Stage" checkbox
 * @param {function} [props.upperOrderMethod] - Move row up handler
 * @param {function} [props.downOrderMethod] - Move row down handler
 * @param {string} [props.positionClass="text-left"] - Text alignment for cell content
 * @param {boolean} [props.changeOrder=false] - Enable order change arrows
 * @param {"MAX"|"MIN"|"MIDDLE"} [props.orderStatus="MIDDLE"] - Controls visibility of up/down arrows
 * @param {boolean|number} [props.isDefault=false] - "Default" checkbox state
 * @param {boolean|number} [props.isFinalStage=false] - "Final Stage" checkbox state
 * @param {Object} [props.dataIconLetter] - Letter avatar: { letter: string, bgColor: string }
 * @param {boolean} [props.isDataIcon=false] - Render letter avatar instead of icon
 * @param {string} [props.modelEditRouteName=""] - Route name for avatar link
 * @param {string|number} [props.modelId=""] - Model ID for avatar link
 * @param {string} [props.badgeClass=""] - Additional classes for label/badge
 * @param {boolean} [props.hasTooltip=false] - Enable DaisyUI tooltip on label
 * @param {string} [props.setTooltipClass="tooltip tooltip-left tooltip-warning"] - Tooltip direction and style
 * @param {string} [props.dataTooltip=""] - Tooltip content text (translated or static)
 *
 * @returns {JSX.Element} Styled <td> with conditional content and optional order controls
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function TableTdComponent({
    label = "",
    tdIcon = "",
    classList = "",
    action = null,
    iconClass = "h-4 w-4 cursor-pointer",
    value = "",
    isDelete = true,
    isActive = false,
    editIcon = "edit",
    deleteIcon = "delete",
    notDeleteIcon = "notDelete",
    title = "",
    statusMethod,
    defaultMethod,
    finalStageMethod,
    upperOrderMethod,
    downOrderMethod,
    positionClass = "text-left",
    changeOrder = false,
    orderStatus = "MIDDLE",
    isDefault = false,
    isFinalStage = false,
    dataIconLetter = "",
    isDataIcon = false,
    modelEditRouteName = "",
    modelId = "",
    badgeClass = "",
    hasTooltip = false,
    setTooltipClass = "tooltip tooltip-left tooltip-warning",
    dataTooltip = "",
}) {
    const { tenant } = usePage().props;

    const __ = useTranslations();
    const baseIconClass = "h-4 w-4 cursor-pointer";

    /* ========================
       Action Buttons Rendering
       ======================== */
    const renderActionButtons = () => {
        const actions = Array.isArray(action) ? action : action ? [action] : [];

        return (
            <div className="flex flex-wrap justify-center items-center gap-2">
                {actions.map((item, index) => {
                    if (!item) return null;

                    if (item.name === "EDIT" && item.link && item.params) {
                        return (
                            <Link
                                key={index}
                                href={route(item.link, {
                                    tenant,
                                    [item.params]: value,
                                })}
                                title={__("Edit")}
                                className="flex items-center"
                            >
                                <IconComponent
                                    icon={item.icon || editIcon}
                                    classList={`${baseIconClass} ${iconClass}`}
                                    title={__("Edit")}
                                />
                            </Link>
                        );
                    }

                    if (
                        item.name === "DELETE" &&
                        typeof item.method === "function"
                    ) {
                        return (
                            <button
                                key={index}
                                onClick={(e) =>
                                    isDelete === false
                                        ? null
                                        : item.method(value, isDelete, e)
                                }
                                data-tip={
                                    isDelete === false
                                        ? __("Not deletable")
                                        : __("Delete")
                                }
                                className={`flex items-center tooltip tooltip-left tooltip-secondary`}
                            >
                                <IconComponent
                                    icon={
                                        isDelete === false
                                            ? notDeleteIcon
                                            : deleteIcon
                                    }
                                    classList={`text-error ${baseIconClass} ${iconClass}`}
                                />
                            </button>
                        );
                    }

                    if (
                        item.name === "COMMON" &&
                        typeof item.method === "function"
                    ) {
                        return (
                            <button
                                key={index}
                                onClick={() => item.method(value)}
                                title={__(item.title || title)}
                                className="flex items-center"
                            >
                                <IconComponent
                                    icon={item.icon || editIcon}
                                    classList={`${baseIconClass} ${iconClass}`}
                                />
                            </button>
                        );
                    }

                    return null;
                })}
            </div>
        );
    };

    /* ========================
       Order Change Arrows
       ======================== */
    const renderOrderArrows = () => {
        if (!changeOrder) return null;

        const arrowClass = `text-error ${baseIconClass} ${iconClass}`;

        return (
            <>
                {(orderStatus === "MAX" || orderStatus === "MIDDLE") && (
                    <button
                        onClick={upperOrderMethod}
                        title={__("Upper")}
                        className="flex items-center"
                    >
                        <IconComponent
                            icon="upperArrow"
                            classList={arrowClass}
                        />
                    </button>
                )}
                {(orderStatus === "MIN" || orderStatus === "MIDDLE") && (
                    <button
                        onClick={downOrderMethod}
                        title={__("Down")}
                        className="flex items-center"
                    >
                        <IconComponent
                            icon="downArrow"
                            classList={arrowClass}
                        />
                    </button>
                )}
            </>
        );
    };

    /* ========================
   Status Toggle Switch
   ======================== */
    const renderStatusSwitch = () => {
        if (!isDelete) {
            return <span className="text-base-content/50">-</span>;
        }

        return (
            <label className="inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive == 1}
                    onChange={statusMethod}
                />
                <div className="relative w-9 h-5 bg-base-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-brandColor peer-checked:bg-brandColor after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-base-300 after:rounded-full after:h-4 after:w-4 after:transition-all" />
                <span className="ms-2 text-sm font-medium text-base-content">
                    {isActive == 1 ? __("Active") : __("Inactive")}
                </span>
            </label>
        );
    };

    /* ========================
   Render default checkbox
   ======================== */
    const renderDefaultCheckbox = () => (
        <label className="inline-flex items-center cursor-pointer text-base-content">
            <input
                type="checkbox"
                checked={isDefault == 1}
                onChange={defaultMethod}
            />
            <span className="ms-1">{__("Default")}</span>
        </label>
    );

    /* ========================
   Render final stage  checkbox
   ======================== */
    const renderFinalStageCheckbox = () => (
        <label className="inline-flex items-center cursor-pointer text-base-content">
            <input
                type="checkbox"
                checked={isFinalStage == 1}
                onChange={finalStageMethod}
            />
            <span className="ms-1">{__("Final Stage")}</span>
        </label>
    );

    const renderIconWithLabel = () => (
        <span className="inline-flex items-center gap-1 truncate text-base-content">
            <IconComponent icon={tdIcon || "edit"} classList="text-lg" />
            {label}
        </span>
    );

    const renderLetterAvatar = () => (
        <Link
            href={
                modelId &&
                modelEditRouteName &&
                route(modelEditRouteName, { tenant, user: modelId })
            }
            className="inline-flex items-center gap-1 truncate"
        >
            <span
                className={`flex items-center justify-center min-h-4 text-[10px] font-bold text-base-100 uppercase ${
                    dataIconLetter?.letter?.length > 1
                        ? "w-auto px-1.5 rounded-sm"
                        : "w-4 rounded-full"
                }`}
                style={{ backgroundColor: dataIconLetter.bgColor }}
            >
                {dataIconLetter.letter}
            </span>
            <span className="text-base-content/75 capitalize hover:underline">
                {label}
            </span>
        </Link>
    );

    /* ========================
       Main Content Decision
       ======================== */
    const renderContent = () => {
        if (action) return renderActionButtons();
        if (statusMethod) return renderStatusSwitch();
        if (defaultMethod) return renderDefaultCheckbox();
        if (finalStageMethod) return renderFinalStageCheckbox();
        if (tdIcon) return renderIconWithLabel();
        if (isDataIcon && dataIconLetter) return renderLetterAvatar();

        return (
            <div
                className={`${hasTooltip ? setTooltipClass : ""}`}
                data-tip={__(dataTooltip)}
            >
                <span
                    className={`inline-block text-base-content/75 ${badgeClass}`}
                >
                    {label}
                </span>
            </div>
        );
    };

    return (
        <td className="px-3 py-2 whitespace-nowrap text-sm font-normal w-32 ${classList} ${positionClass}">
            <div
                className={`flex flex-wrap items-center gap-2 sm:gap-3 } ${positionClass}`}
            >
                {renderContent()}
            </div>

            {renderOrderArrows()}
        </td>
    );
}
