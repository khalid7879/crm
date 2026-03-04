import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    menuItems,
    featureSectionData,
    featuresSectionTopData,
} from "@/utils/nav/homeStaticData";
import IconComponent from "@/Components/IconComponent";
import FeaturesSectionContentComponent from "@/Components/Website/Addons/FeaturesSectionContentComponent";
import { useTranslations } from "@/hooks/useTranslations";
import SectionHeaderComponent from "@/Components/Website/Addons/SectionHeaderComponent";

/**
 * @component FeaturesSectionComponent
 * @description
 * Sticky sidebar with smooth scrolling navigation and PERFECT active state highlighting
 * when scrolling manually or via button click.
 *
 * Features:
 * - Accurate active section detection via IntersectionObserver
 * - Smooth scroll to section on button click
 * - Immediate active highlight on click
 * - Responsive design (hidden on mobile)
 * - High performance with proper cleanup
 * - Top Title and Description from static data
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function FeaturesSectionComponent() {
    const __ = useTranslations();

    const [active, setActive] = useState(menuItems[0]?.id || "");
    const sectionRefs = useRef({}); // { "section1": ref, "section2": ref, ... }

    /* === IntersectionObserver: Detect when section enters viewport === */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("id");
                        if (id) {
                            setActive(id);
                        }
                    }
                });
            },
            {
                root: null, // viewport
                rootMargin: "-20% 0px -30% 0px", // Triggers when ~50-70% of section is visible
                threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
            }
        );

        // Observe all section elements that exist
        Object.values(sectionRefs.current).forEach((ref) => {
            if (ref && ref.current) {
                observer.observe(ref.current);
            }
        });

        // Cleanup on unmount
        return () => {
            observer.disconnect();
        };
    }, []); // Run once on mount

    // === Smooth Scroll to Section on Button Click ===
    const scrollToSection = useCallback((id) => {
        const element = sectionRefs.current[id]?.current;
        if (element) {
            const headerOffset = 120; // Adjust based on your fixed header height
            const elementPosition =
                element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });

            // Instantly update active state for immediate feedback
            setActive(id);
        }
    }, []);

    return (
        <section className="w-full mt-24">
            <SectionHeaderComponent
                sectionHeading={__(featuresSectionTopData.title.text)}
                sectionInfo={__(featuresSectionTopData.description.text)}
            />

            <div className="lg:flex lg:gap-12 xl:gap-16">
                {/* Sticky Sidebar */}
                <aside
                    className="hidden lg:block lg:w-60 sticky top-24 h-fit space-y-3 py-6"
                    aria-label="Features navigation"
                >
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = active === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`
                                        group relative flex items-center gap-3 w-full pl-6 pr-3 py-3 rounded-2xl text-left
                                        transition-all duration-300 ease-out cursor-pointer
                                        ${
                                            isActive
                                                ? ""
                                                : "text-base-content/70"
                                        }
                                    `}
                                    aria-current={isActive ? "true" : "false"}
                                >
                                    {/* Active Indicator Bar */}
                                    <div
                                        className={`
                                            absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-500
                                            ${
                                                isActive
                                                    ? "bg-brandColor scale-y-100"
                                                    : "bg-base-content/70 scale-y-0 group-hover:scale-y-100 group-hover:bg-brandColor "
                                            }
                                        `}
                                    />

                                    {/* Icon */}
                                    <IconComponent
                                        icon={item.icon}
                                        classList={`w-5 h-5 transition-all duration-300 ${
                                            isActive
                                                ? "text-brandColor drop-shadow-md"
                                                : "text-base-content/70 group-hover:text-brandColor"
                                        }`}
                                    />

                                    <span
                                        className={`font-semibold text-lg tracking-wide ${
                                            isActive
                                                ? "text-brandColor "
                                                : "text-base-content/70 group-hover:text-brandColor"
                                        }`}
                                    >
                                        {__(item.label)}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <article className="flex-1 w-full">
                    {featureSectionData.map((item) => (
                        <FeaturesSectionContentComponent
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            sectionData={item}
                            /* Forward ref properly to store DOM element */
                            ref={(el) => {
                                if (el) {
                                    sectionRefs.current[item.id] = {
                                        current: el,
                                    };
                                } else {
                                    delete sectionRefs.current[item.id];
                                }
                            }}
                        />
                    ))}
                </article>
            </div>
        </section>
    );
}
