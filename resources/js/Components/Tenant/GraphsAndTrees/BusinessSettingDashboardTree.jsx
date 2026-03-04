import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { navItems } from "@/utils/nav/navItems.js";
import IconComponent from "@/Components/IconComponent";
import { useRoute } from "ziggy";
import { useTranslations } from "@/hooks/useTranslations";

/**
 * BusinessSettingDashboardTree Component
 *
 * @component
 * @description
 * Renders a hierarchical tree structure for the Business Settings dashboard.
 * The parent items represent top-level setting categories, and the child items
 * display the navigable sub-sections. Each group forms a visual vertical tree
 * with step indicators, icons, and links.
 *
 * The component:
 * - Retrieves navigation items based on user permissions.
 * - Groups nav items into parent–child structures.
 * - Displays each parent as the root of a tree.
 * - Shows child items as numbered steps with connectors and icons.
 *
 * @returns {JSX.Element} A rendered settings tree UI.
 *
 * @example
 * <BusinessSettingDashboardTree />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function BusinessSettingDashboardTree() {
    const { tenant, authPermissions } = usePage().props;
    const route = useRoute();
    const __ = useTranslations();

    /* Memoized navigation items */
    const items = useMemo(() => navItems(authPermissions), [authPermissions]);

    /* Build parent-child tree structures */
    const trees = [];
    let currentParent = null;
    let currentChildren = [];

    for (let item of items) {
        if (item.isParent) {
            if (currentParent && currentChildren.length) {
                trees.push({
                    parent: currentParent,
                    children: currentChildren,
                });
            }
            currentParent = item;
            currentChildren = [];
        } else if (currentParent) {
            currentChildren.push(item);
        }
    }
    if (currentParent && currentChildren.length) {
        trees.push({ parent: currentParent, children: currentChildren });
    }

    return (
        <div className="space-y-10 max-w-auto mx-auto p-2">
            {trees.map((tree, idx) => (
                <div
                    key={idx}
                    className="p-4 rounded-lg bg-base-100 border border-base-300 relative"
                >
                    <div className="flex flex-col items-center relative">
                        {/* Parent node */}
                        <div className="bg-brandColor border border-base-300 rounded-full px-6 py-4 shadow-xl z-10">
                            <div className="flex flex-col items-center text-white font-semibold">
                                <IconComponent icon={tree.parent.icon} />
                                <span className="text-base mt-1">
                                    {__(tree.parent.label)}
                                </span>
                            </div>
                        </div>

                        {/* Vertical line from parent to horizontal line */}
                        <div className="w-px h-10 bg-brandColor z-0" />

                        {/* Horizontal line under parent connecting children */}
                        <div className="relative w-full h-10 flex justify-center items-center">
                            <div className="absolute top-1/2 left-10 right-10 h-px bg-brandColor z-0" />
                        </div>

                        {/* Children nodes */}
                        <div className="flex justify-center flex-wrap gap-8 mt-2">
                            {tree.children.map((child, index) => (
                                <TreeNode
                                    key={child.label}
                                    icon={child.icon}
                                    label={child.label}
                                    topLabel={`${index + 1}${
                                        index === 0
                                            ? "st"
                                            : index === 1
                                            ? "nd"
                                            : index === 2
                                            ? "rd"
                                            : "th"
                                    } step`}
                                    link={route(child.link, { tenant })}
                                    stepIndex={index + 1}
                                    tenant={tenant}
                                    __={__}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * TreeNode Component
 *
 * @component
 * @description
 * Represents a single child node in the Business Settings tree. Displays:
 * - Step index number
 * - Connector line + arrow
 * - A rounded clickable node box with icon, label, and step text
 *
 * @param {Object} props
 * @param {string} props.icon - Icon name for the tree node.
 * @param {string} props.label - Display label for the node.
 * @param {string} props.topLabel - Upper small label (e.g., "1st step").
 * @param {string} props.link - Inertia route link for navigation.
 * @param {number} props.stepIndex - Sequential step number.
 * @param {Function} props.__ - Translation function returned from useTranslations().
 *
 * @returns {JSX.Element} A rendered tree child node.
 *
 * @example
 * <TreeNode
 *    icon="settings"
 *    label="General Settings"
 *    topLabel="1st step"
 *    link="/settings/general"
 *    stepIndex={1}
 *    __={translate}
 * />
 */
const TreeNode = ({ icon, label, topLabel, link, stepIndex, __ }) => (
    <div className="flex flex-col items-center relative ">
        {/* Step number label */}
        <div className="mb-1 text-sm font-bold text-brandColor">
            {stepIndex}
        </div>

        {/* Arrow connector */}
        <div className="w-px h-6 bg-brandColor" />
        <div className="w-3 h-3 rotate-45 bg-brandColor -mt-1 mb-4" />

        {/* Node box */}
        <div className="bg-base-100 hover:bg-brandColor border border-brandColor rounded-full p-4 shadow-lg hover:shadow-xl transition duration-300 ease-in-out group w-[160px]">
            <Link
                href={link ? link : "#"}
                className="flex flex-col items-center text-sm text-base-content group-hover:text-white"
            >
                <IconComponent icon={icon} />
                <span className="font-medium text-center mt-1">
                    {__(label)}
                </span>
                <span className="text-xs mt-1 font-Oswald text-brandColor group-hover:text-white">
                    {__(topLabel)}
                </span>
            </Link>
        </div>
    </div>
);
