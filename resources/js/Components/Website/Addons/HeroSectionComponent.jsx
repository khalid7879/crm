import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import LazyImageComponent from "@/Components/Common/LazyImageComponent";
import SeoImageComponent from "@/Components/Common/SeoImageComponent";
import WhiteBtnComponent from "@/Components/Website/Buttons/WhiteBtnComponent";
import BrandBtnComponent from "@/Components/Website/Buttons/BrandBtnComponent";
import BlockquoteComponent from "./BlockquoteComponent";
import { homeHeroSectionComponentData } from "@/utils/nav/homeStaticData";
import SectionHeaderComponent from "@/Components/Website/Addons/SectionHeaderComponent";

/**
 * @component HeroSectionComponent
 * @description
 * Simple & clean hero section with minimal but elegant animations:
 * - FULL section scrolls in smoothly from bottom
 * - Soft fade + blur reveal (no jump)
 * - Scroll-linked animation (not time-based)
 * - Design & layout remain unchanged
 */
export default function HeroSectionComponent() {
    const __ = useTranslations();
    const sectionRef = useRef(null);

    /* Scroll progress for this section */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 85%", "start 30%"],
    });

    /* Scroll-driven transforms for whole section */
    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
    const blur = useTransform(
        scrollYProgress,
        [0, 1],
        ["blur(12px)", "blur(0px)"]
    );

    return (
        <section ref={sectionRef} className="py-12 px-4">
            {/* === FULL SECTION SCROLL REVEAL WRAPPER === */}
            <motion.div
                style={{
                    opacity,
                    y,
                    filter: blur,
                }}
                className="text-center"
            >
                <SectionHeaderComponent
                    sectionHeading={__(homeHeroSectionComponentData.title)}
                    sectionInfo={__(homeHeroSectionComponentData.description)}
                />

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 my-10">
                    <Link href="/login">
                        <BrandBtnComponent />
                    </Link>
                    <Link href="/register">
                        <WhiteBtnComponent />
                    </Link>
                </div>

                {/* Free trial text */}
                <p className="text-xl md:text-3xl text-base-content/60 italic my-10">
                    {__("Start free trial - no credit card required")}
                </p>

                {/* Dashboard Image */}
                <div className="max-w-7xl mx-auto shadow-2xl rounded-2xl overflow-hidden">
                    <LazyImageComponent keys={["hero"]}>
                        {(images) => (
                            <SeoImageComponent
                                width="1200"
                                height="600"
                                className="w-full h-auto"
                                src={images?.hero?.src}
                                alt={images?.hero?.alt || "CRM Dashboard"}
                                priority={true}
                            />
                        )}
                    </LazyImageComponent>
                </div>

                {/* Blockquote */}
                <div className="mt-16 text-start">
                    <BlockquoteComponent text="Powering customer operations for businesses across nearly every industry with iHelp CRM" />
                </div>
            </motion.div>
        </section>
    );
}
