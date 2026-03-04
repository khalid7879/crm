import React from "react";
import IconComponent from "@/Components/IconComponent";
import AddButtonComponent from "@/Components/Tenant/Buttons/AddButtonComponent";
import { usePage, Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import { _subString } from "@/utils/common/helpers";

/***
 * BreadcrumbComponent
 * -------------------
 * Renders page breadcrumb navigation along with an optional Add button.
 *
 * @component
 * @param {object} props
 * @param {string} [props.icon="arrowRight"] - Icon used between breadcrumb items.
 * @param {string} [props.btnIcon=""] - Icon for the Add button.
 * @param {string} [props.iconClass="text-base text-gray-400"] - Tailwind classes for breadcrumb icons.
 * @param {string} [props.title="Default title"] - Main page title displayed at the start.
 * @param {string} [props.link=""] - Link for the Add button.
 * @param {Array<{ name: string, link?: string }>} [props.navItems=[]] - Array of breadcrumb items.
 * @param {string} [props.iconTitle="Add new"] - Tooltip for the Add button.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 ***/
export default function BreadcrumbComponent({
    icon = "arrowRight",
    btnIcon = "",
    iconClass = "text-base text-gray-400",
    title = "Default title",
    link = "",
    navItems = [],
    iconTitle = "Add new",
    isShowListPageActionBtns = false,
    listPageActionButtons = [],
}) {
    const { tenant } = usePage().props;
    const __ = useTranslations();

    const hasBreadcrumb = Array.isArray(navItems) && navItems.length > 0;

    return (
        <div className="bg-base-100 flex flex-col md:flex-row justify-between items-center pb-0 pt-1 gap-4 px-2 min-w-[140px]">
            {/* Page title and optional Add Button */}
            {title && (
                <div className="flex items-center gap-2 text-2xl">
                    <h2 className="font-semibold font-Oswald text-gray-500 tracking-wider text-xl ">
                        {_subString(__(title), 85)}
                    </h2>
                    {link && (
                        <AddButtonComponent
                            icon={btnIcon}
                            link={link}
                            iconTitle={__(iconTitle)}
                        />
                    )}
                </div>
            )}
            {isShowListPageActionBtns && listPageActionButtons && (
                <div className="btn-group">
                    {listPageActionButtons.map((btn, index) => (
                        <button
                            key={index}
                            onClick={btn.onClick}
                            className={`
                btn btn:lg md:btn-sm lg:btn-xs border-none
                ${index === 0 ? "rounded-l-2xl" : ""}
                ${
                    index === listPageActionButtons.length - 1
                        ? "rounded-r-2xl"
                        : ""
                }
                ${
                    index !== 0 && index !== listPageActionButtons.length - 1
                        ? "rounded-none"
                        : ""
                }
                hover:bg-base-200 hover:text-brandColor
                focus-visible:outline-none focus-visible:ring focus-visible:ring-brandColor/30
                transition-all duration-150
            `}
                        >
                            {/* ICON: hidden on mobile, shown on md+ */}
                            {btn.icon && (
                                <IconComponent
                                    icon={btn.icon}
                                    className="mr-1"
                                />
                            )}

                            {/* Always visible text */}
                            <span className="hidden lg:inline-flex">
                                {__(btn.label)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Breadcrumb Trail */}
            {hasBreadcrumb && (
                <nav className="flex flex-wrap items-center text-sm font-DMSans text-gray-500">
                    {/* Dashboard link */}
                    <Link
                        href={route("tenant.dashboard", { tenant })}
                        className="hover:underline"
                    >
                        {__("Dashboard")}
                    </Link>

                    {/* Arrow after Dashboard */}
                    <IconComponent
                        icon={icon}
                        classList={`${iconClass} mx-1`}
                    />

                    {/* Dynamic navItems */}
                    {navItems.map((item, index) => (
                        <React.Fragment key={index}>
                            {item?.link ? (
                                <Link
                                    href={route(item.link, { tenant })}
                                    className="hover:underline"
                                >
                                    {__(item.name)}
                                </Link>
                            ) : (
                                <span className="text-gray-400">
                                    {__(item.name)}
                                </span>
                            )}

                            {/* Arrow except for the last item */}
                            {index !== navItems.length - 1 && (
                                <IconComponent
                                    icon={icon}
                                    classList={`${iconClass} mx-1`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}
        </div>
    );
}
