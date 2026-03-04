import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import LazyImageComponent from "@/Components/Common/LazyImageComponent";
import SeoImageComponent from "@/Components/Common/SeoImageComponent";
import { homeAiFeature } from "@/utils/nav/homeStaticData";
import SectionHeaderComponent from "@/Components/Website/Addons/SectionHeaderComponent";

/**
 * @component AiSectionComponent
 * @description
 * Renders the AI-powered features section on the iHELP CRM marketing page.
 * Displays a centered heading and description at the top, followed by a responsive two-column layout:
 * - Left column: Interactive list of AI features with hover effects and smooth transitions.
 * - Right column: Large illustrative image of the AI CRM dashboard, wrapped in a card with subtle shadow and decorative blur orbs.
 * Fully leverages DaisyUI 5 for theming, accessibility, and modern styling.
 *
 * @example
 * <AiSectionComponent />
 *
 * @author Mamun <mamunhossen149191@gmail.com>
 * @author MH Emon <mhemon833@gmail.com>
 */
export default function AiSectionComponent() {
    const __ = useTranslations();

    return (
        <section className="py-16 bg-base-100">
            {/* Section Header */}
            <SectionHeaderComponent
                sectionHeading={homeAiFeature?.sectionHeading}
                sectionInfo={homeAiFeature?.sectionInfo}
            />

            {/* Main Content Grid */}
            <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* Left: Feature List */}
                <aside className="space-y-0">
                    {homeAiFeature?.items?.map((feature, index) => (
                        <div
                            key={index}
                            className="group cursor-pointer transition-all duration-300 hover:bg-base-200 rounded-xl p-6  border border-transparent hover:border-base-300 hover:scale-102"
                        >
                            <h3 className="text-xl font-semibold text-base-content group-hover:text-brandColor transition-colors duration-300 mb-2">
                                {__(feature.title)}
                            </h3>
                            <p className="text-base text-base-content/70 leading-relaxed">
                                {__(feature.description)}
                            </p>
                        </div>
                    ))}
                </aside>

                {/* Right: AI Visual */}
                <aside className="flex justify-center md:justify-end">
                    <div className="relative w-full max-w-lg">
                        <figure className="p-4 md:p-6">
                            <LazyImageComponent keys={["aiCrm"]}>
                                {(images) => (
                                    <SeoImageComponent
                                        className="rounded-md w-full h-auto object-contain"
                                        src={images?.aiCrm?.src}
                                        alt={
                                            images?.aiCrm?.alt ||
                                            "iHelp Ai Assistant"
                                        }
                                        priority={true}
                                    />
                                )}
                            </LazyImageComponent>
                        </figure>
                    </div>
                </aside>
            </main>
        </section>
    );
}
