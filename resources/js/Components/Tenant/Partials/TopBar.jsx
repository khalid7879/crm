import React, { useEffect, useRef, useState } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import { useRoute } from "ziggy";
import { swalToast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import ThemeToggle from "@/Components/Tenant/Common/ThemeToggle";
import IconComponent from "@/Components/IconComponent";
import ExternalTaskCreateModal from "@/Components/Tenant/Operations/Commons/ExternalTaskCreateModal";
import ExternalContactCreateModal from "@/Components/Tenant/Operations/Commons/ExternalContactCreateModal";
import ExternalOpportunityCreateModal from "@/Components/Tenant/Operations/Commons/ExternalOpportunityCreateModal";
import ExternalOrganizationCreateModal from "@/Components/Tenant/Operations/Commons/ExternalOrganizationCreateModal";
import ExternalProjectCreateModal from "@/Components/Tenant/Operations/Commons/ExternalProjectCreateModal";

/**
 * Topbar Component
 *
 * A reusable top navigation bar designed for dashboard layouts.
 * Supports branding, navigation controls, user actions, and optional
 * right-side UI elements. Fully customizable and styled with TailwindCSS.
 *
 * @component
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.title] - The title or label displayed on the topbar.
 * @param {React.ReactNode} [props.leftContent] - Optional content rendered on the left side (e.g., menu button).
 * @param {React.ReactNode} [props.rightContent] - Optional content rendered on the right side (e.g., profile menu, notifications).
 * @param {boolean} [props.sticky=true] - Whether the topbar should remain fixed at the top.
 *
 * @example
 * <Topbar
 *   title="Dashboard"
 *   leftContent={<MenuButton />}
 *   rightContent={<UserDropdown />}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function TopBar() {
    const __ = useTranslations();
    const { staticImages, routeNames, tenant, toastAlert } = usePage().props;
    const route = useRoute();

    const [isModalOpen, setIsModalOpen] = useState(false);

    /** Device size detection */
    const [isSmallDevice, setIsSmallDevice] = useState(
        typeof window !== "undefined" ? window.innerWidth < 640 : false
    );

    useEffect(() => {
        const handleResize = () => setIsSmallDevice(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /** Create modal handling */
    const [model, setModel] = useState(null);
    const [modals, setModals] = useState({
        task: false,
        contact: false,
        opportunity: false,
        organization: false,
        project: false,
    });

    const openModal = (name) => {
        setModals((prev) => ({ ...prev, [name]: true }));
        setIsModalOpen(true);
    };

    const addNewItems = [
        { key: "task", icon: "task", label: "Add new task" },
        { key: "contact", icon: "contact", label: "Add new contact" },
        { key: "lead", icon: "users3", label: "Add new lead" },
        {
            key: "opportunity",
            icon: "opportunity2",
            label: "Add new opportunity",
        },
        {
            key: "organization",
            icon: "organization",
            label: "Add new organization",
        },
        { key: "project", icon: "projects", label: "Add new project" },
    ];

    const handleNewItem = (key) => {
        setModel(key.toUpperCase());
        if (key === "lead") {
            router.get(route("tenant.leads.create", { tenant }));
        } else {
            openModal(key);
        }
    };

    /** Toast listener */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
        }
    }, [toastAlert]);

    /** SEARCH BAR ===================== */
    const [query, setQuery] = useState("");
    const [moduleType, setModuleType] = useState("all");
    const [openDropdown, setOpenDropdown] = useState(false);

    const dropdownRef = useRef();

    // Auto-close dropdown on click outside
    useEffect(() => {
        const close = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, []);

    const handleSearch = (e) => {
        if (e.key !== "Enter") return;

        e.preventDefault();
        if (!query.trim()) return;

        router.get(route("tenant.model.search", { tenant }), {
            preserveScroll: true,
            preserveState: true,
            data: { query, module: moduleType },
        });
    };

    /** LOGOUT */
    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route("tenant.logout", { tenant }));
    };

    return (
        <div className="navbar bg-base-100 border-b border-base-300 fixed top-0 left-0 z-40 text-base-content px-4">
            {/* LEFT: Logo */}
            <div className="navbar-start">
                <Link href={route("tenant.dashboard", { tenant })}>
                    <img
                        src={
                            isSmallDevice
                                ? staticImages?.favicon
                                : staticImages?.logo
                        }
                        alt="Logo"
                        className={isSmallDevice ? "max-w-8" : "w-28 md:w-32"}
                    />
                </Link>
            </div>

            {/* MIDDLE: SEARCH BAR */}
            <div className="navbar-center hidden sm:flex">
                <div
                    ref={dropdownRef}
                    className="
      group flex items-center gap-2 border rounded-md px-3 py-1
      border-brandColor/50 bg-base-100 shadow-sm
      transition-all duration-300 ease-in-out
      focus-within:shadow-md focus-within:border-brandColor
      w-72 md:w-80 lg:w-100 group-focus-within:w-80
    "
                >
                    {/* MODULE DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(!openDropdown)}
                            className="flex items-center gap-1 text-sm px-1 py-0.5 text-base-content/70 hover:text-base-content transition"
                        >
                            <span className="capitalize">
                                {moduleType === "all"
                                    ? __("All")
                                    : __(moduleType)}
                            </span>
                            <IconComponent
                                icon="arrowDown"
                                classList="text-xs"
                            />
                        </button>

                        {openDropdown && (
                            <ul
                                className="
            absolute left-0 mt-1 w-32 bg-base-100 shadow-lg 
            rounded-md border border-brandColor/40 
            animate-fadeIn z-50
          "
                            >
                                {["all", "lead", "task"].map((item) => (
                                    <li
                                        key={item}
                                        className="px-3 py-1.5 text-sm cursor-pointer hover:bg-brandColor/10 capitalize"
                                        onClick={() => {
                                            setModuleType(item);
                                            setOpenDropdown(false);
                                        }}
                                    >
                                        {item === "all"
                                            ? __("All Modules")
                                            : __(item)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="w-px h-6 bg-base-content/20 mx-1" />

                    {/* CENTER: perfectly aligned icon + input */}
                    <div className="flex items-center flex-1 gap-3">
                        {/* icon box: fixed square so icon truly centers */}
                        <div className="flex items-center justify-center h-6 w-6 flex-none">
                            <IconComponent
                                icon="search"
                                classList="text-base-content/60 text-base block !leading-none !m-0 !p-0"
                            />
                        </div>

                        {/* input: fills remaining space; match height and line-height */}
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            placeholder={__("Search here")}
                            className="flex-1 bg-transparent text-sm placeholder:text-base-content/50 outline-none px-0 py-0 h-6 leading-6"
                        />
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTIONS */}
            <div className="navbar-end md:flex gap-5 items-center">
                <ThemeToggle />

                {/* SEARCH ICON (Mobile) */}
                <button className="hover:text-brandColor transition flex sm:hidden">
                    <IconComponent
                        icon="search"
                        classList="text-base-content/50 text-2xl"
                    />
                </button>

                {/* ADD NEW */}
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle"
                    >
                        <IconComponent
                            icon="add"
                            classList="text-base-content/50 text-2xl"
                        />
                    </div>

                    <ul className="menu menu-sm dropdown-content mt-2 w-48 bg-base-100 border border-base-300 rounded-md shadow-md z-50">
                        {addNewItems.map((item, idx) => (
                            <li key={idx}>
                                <button onClick={() => handleNewItem(item.key)}>
                                    <IconComponent
                                        icon={item.icon}
                                        classList="text-sm"
                                    />
                                    {__(item.label)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* NOTIFICATION */}
                <button className="hover:text-brandColor transition">
                    <IconComponent
                        icon="notificationRing"
                        classList="text-base-content/50 text-2xl"
                    />
                </button>

                {/* PROFILE MENU */}
                <div className="dropdown dropdown-end">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle"
                    >
                        <IconComponent
                            icon="userCircle"
                            classList="text-base-content/50 text-2xl"
                        />
                    </div>

                    <ul className="menu menu-sm dropdown-content mt-2 w-44 bg-base-100 border border-base-300 rounded-md shadow-md z-50">
                        <li>
                            <Link href={route("tenant.setting", { tenant })}>
                                <IconComponent
                                    icon="tools"
                                    classList="text-sm"
                                />
                                {__("System setting")}
                            </Link>
                        </li>

                        <li>
                            <Link
                                href={route("tenant.user-settings.index", {
                                    tenant,
                                })}
                            >
                                <IconComponent
                                    icon="settingUser"
                                    classList="text-sm"
                                />
                                {__("User setting")}
                            </Link>
                        </li>

                        <li>
                            <span className="border-b border-b-base-300"></span>
                        </li>

                        <li>
                            <button onClick={handleLogout} className="mt-1">
                                <IconComponent
                                    icon="logout"
                                    classList="text-sm"
                                />
                                {__("Logout")}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* MODALS */}
            {modals.task && (
                <ExternalTaskCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    relatedToTypeIsReadOnly={false}
                    model={model}
                />
            )}

            {modals.contact && (
                <ExternalContactCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    relatedToTypeIsReadOnly={false}
                    model={model}
                />
            )}

            {modals.opportunity && (
                <ExternalOpportunityCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    model={model}
                />
            )}

            {modals.organization && (
                <ExternalOrganizationCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    model={model}
                />
            )}

            {modals.project && (
                <ExternalProjectCreateModal
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    model={model}
                />
            )}
        </div>
    );
}
