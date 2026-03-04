import React from "react";
import WebsiteLayout from "@/Components/Website/WebsiteLayout";
import { useTranslations } from "@/hooks/useTranslations";
import HeroSectionComponent from "@/Components/Website/Addons/HeroSectionComponent";
import HeroAnimationSectionComponent from "@/Components/Website/Addons/HeroAnimationSectionComponent";
import FeaturesSectionComponent from "@/Components/Website/Addons/FeaturesSectionComponent";
import AiSectionComponent from "@/Components/Website/Addons/AiSectionComponent";
import PricingSectionComponent from "@/Components/Website/Addons/PricingSectionComponent";

/**
 * @component HomePage
 *
 * @description
 * Frontend home page component responsible for rendering
 * the public landing page of the website.
 *
 * This component integrates the WebsiteLayout for consistent
 * page structure and applies localized metadata using the
 * translation hook. A hero section (HeroSectionComponent) is displayed
 * as the primary visual element.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function HomePage() {
    const __ = useTranslations();
    const metaTitle = __("Home");

    return (
        <WebsiteLayout metaTitle={metaTitle}>
            <HeroAnimationSectionComponent />
            <HeroSectionComponent />
            <FeaturesSectionComponent />
            <AiSectionComponent />
            <PricingSectionComponent />
        </WebsiteLayout>
    );
}
