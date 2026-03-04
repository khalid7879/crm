import React from "react";
import { Link } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import { pricingFeatureData } from "@/utils/nav/homeStaticData";
import SectionHeaderComponent from "@/Components/Website/Addons/SectionHeaderComponent";
import WhiteBtnComponent from "@/Components/Website/Buttons/WhiteBtnComponent";
import BrandBtnComponent from "@/Components/Website/Buttons/BrandBtnComponent";
import IconComponent from "@/Components/IconComponent";
import { swalToast } from "@/utils/toast";
import BlockquoteComponent from "./BlockquoteComponent";

/**
 * @component PricingSectionComponent
 * @description
 * Modern pricing section built with DaisyUI 5 card components.
 * Displays all pricing plans in a responsive grid with visual hierarchy,
 * badges for popular plans, proper checkmark icons, and improved typography.
 * Fully compatible with dark mode and follows DaisyUI best practices.
 *
 * @example
 * <PricingSectionComponent />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author MH Emon <mhemon833@gmail.com>
 * 
 */
export default function PricingSectionComponent() {
    const __ = useTranslations();

    /**
     * Handles the plan selection click.
     * Currently shows a toast indicating the feature is not yet available.
     *
     * @method handlePlanSelect
     */
    const handlePlanSelect = () => {
        swalToast({
            type: "error",
            message: __("Coming soon"),
        });
    };

    return (
        <section className="relative z-20 py-10 lg:py-20 bg-base-100 mb-[100vh] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
            {/* Section Header */}
            <SectionHeaderComponent
                sectionHeading={pricingFeatureData?.sectionHeading}
                sectionInfo={pricingFeatureData?.sectionInfo}
            />

            {/* Pricing Cards - DaisyUI 5 Style */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingFeatureData?.items?.map((plan, index) => (
                    <div
                        key={index}
                        className={`card bg-base-100 shadow-xl border border-base-300 relative hover:scale-105 transition-all duration-500 ease-out ${
                            plan?.isPopular
                                ? "ring-2 ring-brandColor ring-offset-2 ring-offset-base-100"
                                : ""
                        }`}
                    >
                        {/* Most Popular Badge */}
                        {plan?.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="badge badge-lg bg-brandColor font-semibold capitalize text-white">
                                    {__(plan?.tip)}
                                </span>
                            </div>
                        )}

                        <div className="card-body p-5">
                            {/* Plan Title & Price */}
                            <div className="flex flex-col gap-3 pt-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold text-base-content/75 capitalize">
                                        {plan.name}
                                    </h3>
                                    <span className="text-lg italic text-brandColor font-semibold">
                                        {plan.price}
                                    </span>
                                </div>
                            </div>

                            {/* Features List */}
                            <h4 className="mt-3 font-semibold text-base-content/80 text-sm uppercase tracking-wider">
                                {__("Key features")}
                            </h4>

                            <ul className="mt-4 space-y-3">
                                {plan.features.map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <IconComponent
                                            icon="success4"
                                            classList="text-success"
                                        />
                                        <span className="text-base-content/75">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Optional: Add button per card if needed in future */}
                            <div className="card-actions mt-8">
                                <button
                                    className="btn btn-soft btn-block"
                                    onClick={handlePlanSelect}
                                >
                                    {__("Choose")} {__(plan.name)}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-center gap-6 mt-16 flex-wrap">
                <Link href="/login">
                    <BrandBtnComponent />
                </Link>
                <Link href="/register">
                    <WhiteBtnComponent />
                </Link>
            </div>

            {/* Enhanced Beautiful Blockquote Bottom Note */}
            <div className="mt-12">
                <BlockquoteComponent />
            </div>
        </section>
    );
}
