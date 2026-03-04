import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IconComponent from "@/Components/IconComponent";
import LazyImageComponent from "@/Components/Common/LazyImageComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { socialNavItems, legalLinks } from "@/utils/nav/homeStaticData";
import { Link } from "@inertiajs/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Full-screen animated footer with scroll-reveal effect
 *
 * @component
 * @name Footer
 *
 * @description
 * A modern, full-height footer that:
 * - Stays fixed at the bottom of the viewport
 * - Reveals content smoothly with GSAP + ScrollTrigger when scrolling into view
 * - Contains centered logo with glow effect, decorative divider,
 *   legal links, social media icons with tooltips, and copyright info
 * - Uses lazy-loaded logo and translation-ready text
 *
 * Features:
 * - Scroll-triggered fade + slide-up animation
 * - Responsive layout (mobile → stacked, desktop → horizontal)
 * - Hover effects on social icons and links with glow & underline
 * - Subtle radial gradient background texture
 *
 * @example
 * ```jsx
 * <Footer />
 * ```
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author MH Emon <mhemon833@gmail.com>
 */
export default function Footer() {
    const __ = useTranslations();
    const footerRef = useRef(null);
    const contentRef = useRef(null);
    // const logoWrapperRef = useRef(null); // currently unused - kept for potential future animation

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const ctx = gsap.context(() => {
            /**
             * Animate footer content entrance with scroll scrubbing
             */
            gsap.fromTo(
                contentRef.current,
                { y: 250, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: footerRef.current,
                        start: "top bottom",
                        end: "bottom bottom",
                        scrub: 1,
                    },
                }
            );
        }, footerRef);

        return () => ctx.revert();
    }, []);

    return (
        <footer
            ref={footerRef}
            className="fixed bottom-0 left-0 w-full h-screen bg-base-100 flex flex-col justify-center overflow-hidden z-[-1] pointer-events-auto"
        >
            <div
                ref={contentRef}
                className="max-w-7xl mx-auto px-6 lg:px-12 w-full h-full flex flex-col py-24 relative z-10"
            >
                {/* ================= Logo & Decoration ================= */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="relative group w-full max-w-[300px] sm:max-w-[350px] my-6">
                        {/* Glow Effects */}
                        <div className="absolute -inset-10 bg-brandColor/20 blur-[80px] rounded-full -z-10 animate-pulse" />
                        <div className="absolute -inset-4 bg-brandColor/10 blur-[40px] rounded-full -z-10" />

                        <LazyImageComponent keys={["logo"]}>
                            {(images) => (
                                <img
                                    src={images?.logo?.src}
                                    alt="Company Logo"
                                    className="w-full h-auto max-h-[498px] sm:max-h-[550px] object-contain relative z-10 drop-shadow-2xl"
                                    loading="lazy"
                                />
                            )}
                        </LazyImageComponent>
                    </div>

                    {/* Decorative Divider - centered with equal top & bottom spacing */}
                    <div className="flex items-center gap-4 w-full max-w-md my-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brandColor/40 to-transparent" />
                        <div className="w-2.5 h-2.5 rounded-full bg-brandColor shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brandColor/40 to-transparent" />
                    </div>
                </div>

                {/* ================= Links, Social & Copyright ================= */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 mt-auto">
                    {/* Copyright */}
                    <div className="text-base-content/75 text-sm font-medium order-3 md:order-1">
                        © {currentYear}{" "}
                        <a
                            href="https://ihelpbd.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base-content/75 mr-1 italic underline hover:text-brandColor transition-colors"
                        >
                            iHelpBD.
                        </a>
                        {__("All rights reserved")}
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 order-2">
                        {legalLinks?.map((link, i) => (
                            <Link
                                key={i}
                                href={link?.href || "#"}
                                className="text-base-content/75 text-sm font-semibold uppercase tracking-wider hover:text-brandColor transition-all relative group"
                            >
                                {__(link?.label)}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brandColor transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4 order-1 md:order-3">
                        {socialNavItems?.map((item) => (
                            <div
                                key={item?.key}
                                className="tooltip tooltip-top"
                                data-tip={__(item?.label) || item?.key}
                            >
                                <a
                                    href={item?.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative w-11 h-11 flex items-center justify-center rounded-full border border-base-content/25 bg-base-100 shadow-sm transition-all duration-300 hover:bg-brandColor hover:border-brandColor hover:scale-110 cursor-pointer"
                                    aria-label={item?.label || item?.key}
                                >
                                    <IconComponent
                                        icon={item?.icon}
                                        classList="text-base-content/75 text-lg transition-colors duration-300 group-hover:text-white"
                                    />

                                    <div className="absolute inset-0 rounded-full bg-brandColor/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subtle Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.05),transparent_70%)] pointer-events-none" />
        </footer>
    );
}
