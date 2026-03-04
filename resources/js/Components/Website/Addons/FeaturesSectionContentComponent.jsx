import React, { useState, useEffect, forwardRef } from "react";
import IconComponent from "@/Components/IconComponent";
import LazyImageComponent from "@/Components/Common/LazyImageComponent";
import SeoImageComponent from "@/Components/Common/SeoImageComponent";
import { imageRegistry } from "@/utils/images";
import { useTranslations } from "@/hooks/useTranslations";
import BrandBtnComponent from "@/Components/Website/Buttons/BrandBtnComponent";
import { Link } from "@inertiajs/react";

/**
 * @component FeaturesSectionContentComponent
 * @description
 * Individual feature section component with card modal interactions,
 * proper ref forwarding for scroll detection, keyboard accessibility,
 * and responsive design. Optimized for smooth sidebar navigation.
 *
 * @prop {string} id - Unique section identifier for scroll linking
 * @prop {string} title - Section title
 * @prop {Object} sectionData - Section content data with cards, desc, dynamicContent
 *
 * @features
 * - Perfect ref forwarding for parent scroll/IntersectionObserver
 * - Full keyboard accessibility (Enter/Space/Esc)
 * - Click outside to close modal
 * - Smooth hover animations
 * - Responsive design with scroll snap support
 * - Lazy loading & performance optimized
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author MH Emon <mhemon833@gmail.com>
 */
const FeaturesSectionContentComponent = forwardRef(
    ({ id, title, sectionData }, ref) => {
        const __ = useTranslations();

        const [activeCard, setActiveCard] = useState(null);

        /* Handle Escape key to close modal */
        useEffect(() => {
            const handleEsc = (e) => {
                if (e.key === "Escape") {
                    setActiveCard(null);
                }
            };

            if (activeCard) {
                document.addEventListener("keydown", handleEsc);
                return () => document.removeEventListener("keydown", handleEsc);
            }
        }, [activeCard]);

        const current = sectionData;

        const handleCardKeyDown = (e, card) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveCard(card);
            }
        };

        const handleCloseModal = () => setActiveCard(null);

        return (
            <section
                ref={ref}
                id={id}
                className="min-h-[80vh] lg:min-h-screen snap-start bg-gradient-to-br from-base-200 to-base-100 rounded-md p-3 md:p-6  mb-12 lg:mb-16 scroll-mt-32 lg:scroll-mt-36"
                data-section={id}
                role="region"
                aria-labelledby={`${id}-title`}
            >
                {/* Dynamic Testimonial Block */}
                {current?.dynamicContent && (
                    <div className="bg-base-100 backdrop-blur-sm border border-brandColor/25 hover:border-brandColor/50 p-3 lg:p-6 mb-6 rounded-md shadow-md hover:shadow-brandColor/25 hover:scale-102 transition-all duration-500 focus:outline-none focus:ring-3 focus:ring-brandColor/50 focus:shadow-brandColor/25">
                        {/* Removed mb-6 from here to eliminate extra bottom spacing */}
                        <div className="flex flex-col md:flex-row items-start gap-3">
                            <div className=" w-12 h-12 bg-brandColor rounded-md flex items-center justify-center flex-shrink-0 shadow-md mx-auto md:mx-0">
                                <IconComponent
                                    icon={current?.dynamicContent?.icon}
                                    classList="w-6 h-6 text-white"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-bold text-base-content/70 mb-3">
                                    {__(current.dynamicContent.title)}
                                </h3>
                                <blockquote className="text-sm md:text-md text-base-content/70 leading-relaxed border-l-6 border-brandColor italic bg-gradient-to-r from-base-100 to-base-300 p-3 pl-6 rounded-md">
                                    {__(current.dynamicContent.content)}
                                </blockquote>
                                <p className="text-right mt-3 text-lg font-semibold text-brandColor">
                                    — {__(current.dynamicContent.author)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {current.cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => setActiveCard(card)}
                            className="group/card p-3 md:p-6 bg-base-100/80 backdrop-blur-sm rounded-md shadow-md cursor-pointer hover:shadow-brandColor/25 hover:scale-102 hover:border-brandColor/50 border border-brandColor/25 overflow-hidden transition-all duration-500 focus:outline-none focus:ring-3 focus:ring-brandColor/50 focus:shadow-brandColor/25"
                        >
                            <div
                                className="relative w-full h-50 md:h-70 bg-gradient-to-br from-brandColor/10 via-brandColor/5 to-brandColor/20 rounded-md overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-500"
                                style={{
                                    backgroundImage: `url(${imageRegistry?.contentBg?.src})`,
                                }}
                            >
                                <BackdropEffect />

                                <LazyImageComponent keys={[card.image]}>
                                    {(images, index) => (
                                        <SeoImageComponent
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                                            src={images?.[card.image]?.src}
                                            alt={
                                                card?.title || "Image-" + index
                                            }
                                            priority={true}
                                        />
                                    )}
                                </LazyImageComponent>
                            </div>
                            <CardTitle data={__(card.title)} />
                            <CardDescription data={__(card.desc)} />
                        </div>
                    ))}
                </div>

                {/* Enhanced Modal */}
                {activeCard && (
                    <div
                        className="fixed inset-0  backdrop-blur-md flex items-center justify-center z-[9999]"
                        onClick={handleCloseModal}
                        aria-modal="true"
                        role="dialog"
                        aria-labelledby="modal-title"
                    >
                        <div
                            className="backdrop-blur-2xl rounded-md  w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg relative mx-4 animate-scaleUp bg-base-100 border-4 border-base-300/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleCloseModal}
                                className="group absolute right-3 top-3 w-10 h-10 bg-white/80 hover:bg-brandColor text-base-content/75 hover:text-brandColor rounded-md shadow-md flex items-center justify-center hover:scale-110 transition-all duration-200 backdrop-blur-sm border border-brandColor focus:outline-none focus:ring-3 focus:ring-brandColor cursor-pointer z-50 "
                                aria-label="Close modal"
                            >
                                <IconComponent
                                    icon="cross"
                                    classList="text-brandColor group-hover:text-white"
                                />
                            </button>
                            <div
                                className="w-full h-60 md:h-70 bg-gradient-to-br from-brandColor/10 via-brandColor/5 to-brandColor/20rounded-md overflow-hidden mb-3 relative"
                                style={{
                                    backgroundImage: `url(${imageRegistry?.contentBg?.src})`,
                                }}
                            >
                                <BackdropEffect />

                                <LazyImageComponent keys={[activeCard.image]}>
                                    {(images, index) => (
                                        <SeoImageComponent
                                            className="w-full h-full object-contain"
                                            src={
                                                images?.[activeCard.image]?.src
                                            }
                                            alt={
                                                activeCard?.title ||
                                                "ActiveCardImage-" + index
                                            }
                                            priority={true}
                                        />
                                    )}
                                </LazyImageComponent>
                            </div>
                            <article className="p-3">
                                <CardTitle data={__(activeCard.title)} />
                                <CardDescription data={__(activeCard.desc)} />
                                <Link href="/login" className="mt-3 block">
                                    <BrandBtnComponent isBtnBlock={true} />
                                </Link>
                            </article>
                        </div>
                    </div>
                )}
            </section>
        );
    }
);

FeaturesSectionContentComponent.displayName = "FeaturesSectionContentComponent";

export default FeaturesSectionContentComponent;

const BackdropEffect = () => {
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 mix-blend-color opacity-90" />
    );
};

const CardTitle = ({ data = "" }) => {
    return (
        <h3 className="text-lg font-semibold text-base-content/70 mb-3 group-hover:text-brandColor transition-colors duration-300">
            {data}
        </h3>
    );
};

const CardDescription = ({ data = "" }) => {
    return (
        <p className="text-sm text-base-content/70 leading-relaxed line-clamp-3">
            {data}
        </p>
    );
};
