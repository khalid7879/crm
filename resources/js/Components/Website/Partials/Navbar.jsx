import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { HiMenu, HiX } from "react-icons/hi";
import { useTranslations } from "@/hooks/useTranslations";
import LazyImageComponent from "@/Components/Common/LazyImageComponent";
import SeoImageComponent from "@/Components/Common/SeoImageComponent";

/**
 * @component Navbar
 * @description
 * A responsive, fixed-position navigation bar with scroll-aware background blur effect.
 * Features:
 * - Logo display on the left
 * - Desktop and mobile navigation using a reusable menu items configuration
 * - Mobile hamburger menu toggle with smooth slide-down animation
 * - Background transitions from solid white to blurred glass effect when scrolling
 * - Mobile menu automatically closes when a link is clicked
 *
 * Navigation links are defined in a reusable array for easy maintenance and consistency
 * between desktop and mobile views.
 *
 * Built for React with Inertia.js routing and i18n support via useTranslations hook.
 * Fully accessible with proper aria-labels.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function Navbar() {
    const __ = useTranslations();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    /* Track scroll position to apply backdrop blur effect */
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* Close mobile menu when a link is clicked */
    const closeMobileMenu = () => setOpen(false);

    /* Reusable navigation items configuration */
    const navItems = [
        {
            href: "/",
            key: "homepage",
            label: "Home",
            type: "text",
        },
        {
            href: "/",
            key: "contact-us-page",
            label: "Contact us",
            type: "text",
        },
        {
            href: "/login",
            key: "login-page",
            label: "Sign in",
            type: "outline",
        },
        {
            href: "/register",
            key: "register-page",
            label: "Register",
            type: "primary",
        },
    ];

    /* Helper to render a single nav link based on type */
    const renderNavLink = (item, isMobile = false) => {
        const baseClasses = isMobile
            ? "text-base font-medium py-3 text-center transition"
            : "text-sm font-medium transition-colors";

        let linkClasses = baseClasses;

        if (item.type === "text") {
            linkClasses += isMobile
                ? " text-brandColor"
                : " text-base-content/50 hover:text-brandColor";
        } else if (item.type === "outline") {
            linkClasses +=
                " px-5 py-2 rounded-full border border-brandColor text-brandColor hover:bg-orange-50";
        } else if (item.type === "primary") {
            linkClasses +=
                " px-5 py-2 rounded-full bg-brandColor text-white hover:bg-brandColor shadow-sm";
            if (!isMobile) linkClasses += " font-semibold";
            if (isMobile) linkClasses += " font-semibold";
        }

        return (
            <Link
                key={item?.key}
                href={item?.href}
                className={linkClasses}
                onClick={isMobile ? closeMobileMenu : undefined}
            >
                {__(item?.label)}
            </Link>
        );
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-base-300/80 backdrop-blur-md shadow-sm"
                    : "bg-base-100 shadow-lg"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="w-32 h-10 relative">
                            <LazyImageComponent keys={["logo"]}>
                                {(images) => (
                                    <SeoImageComponent
                                        width="1200"
                                        height="600"
                                        className="w-full h-auto rounded-md"
                                        src={images?.logo?.src}
                                        alt={images?.logo?.alt || "Logo"}
                                        priority={true}
                                    />
                                )}
                            </LazyImageComponent>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => renderNavLink(item, false))}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            aria-label={
                                open ? __("Close menu") : __("Open menu")
                            }
                            onClick={() => setOpen((prev) => !prev)}
                            className="p-2 rounded-md text-brandColor hover:bg-orange-50 transition"
                        >
                            {open ? <HiX size={28} /> : <HiMenu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <div
                className={`md:hidden bg-white border-t border-gray-200 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
                    open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav className="px-4 py-6 flex flex-col gap-4">
                    {navItems.map((item) => renderNavLink(item, true))}
                </nav>
            </div>
        </header>
    );
}
