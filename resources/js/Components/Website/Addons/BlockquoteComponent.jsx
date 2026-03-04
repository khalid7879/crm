import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

const BlockquoteComponent = ({
    text = "Special discount available for new customers. this offer has no fixed end date and may be discontinued at any time. for details on product packaging and applicable limits, lease contact us",
}) => {
    const __ = useTranslations();

    return (
        
        <div className="mt-8 md:mt-12 max-w-sm md:max-w-4xl mx-auto px-4">
            <blockquote
                className="group relative overflow-hidden rounded-xl bg-base-200/60 backdrop-blur-sm border border-base-300 
                shadow-lg hover:shadow-2xl transition-all duration-500 ease-out 
                hover:scale-105 hover:-translate-y-2 hover:bg-base-200/80"
            >
                {/* Decorative Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                
                <IconComponent
                    icon="bomb"
                    classList="hidden md:block absolute left-6 top-6 h-12 w-12 text-brandColor/15 group-hover:text-brandColor/25 transition-colors duration-500"
                />

                {/* Left Border Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brandColor/60 group-hover:bg-brandColor transition-colors duration-500" />

                <div className="relative px-6 py-2 md:pl-20 md:pr-8 md:py-10">
                    
                    <p className="text-base-content/75 text-sm md:text-xl leading-relaxed italic font-light tracking-wide text-center md:text-left">
                        {__(text)}
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brandColor/40 via-brandColor/20 to-transparent opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            </blockquote>
        </div>
    );
};

export default BlockquoteComponent;
