import React from "react";
import TenantRootLayout from "@/Components/Tenant/TenantRootLayout";
import SearchSidebar from "@/Components/Tenant/Partials/SearchSidebar";
import MetaData from "@/Components/Root/MetaData";
import "@css/custom-scroll.css";


export default function TenantSearchLayout({
    children,
    className = "w-full rounded-2xl box-con",
    metaKeywords = "",
    metaDescription = "",
    metaTitle = "",
}) {
    return (
        <TenantRootLayout>
            <MetaData
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                metaKeywords={metaKeywords}
            />
            <div className="flex w-full gap-2">
                {/* Fixed left panel */}
                <div className="w-full md:w-40 h-full md:fixed top-[4rem] z-10 overflow-y-auto border-r border-base-300 bg-base-100 scrollbar-thin-scrollbar">
                    <SearchSidebar />
                </div>

                {/* Right panel */}
                <div className={`flex-1 pt-1 ${className} ml-40`}>
                    {children}
                </div>
            </div>
        </TenantRootLayout>
    );
}
