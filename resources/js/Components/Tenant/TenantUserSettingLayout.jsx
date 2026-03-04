import React from "react";
import TenantRootLayout from "@/Components/Tenant/TenantRootLayout";
import SettingsSidebar from "@/Components/Tenant/Partials/SettingsSidebar";
import MetaData from "@/Components/Root/MetaData";
import "@css/custom-scroll.css";
import { userNavItems } from "@/utils/nav/userNavItems";

export default function TenantUserSettingLayout({
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
                <div
                    className="w-full md:w-40 h-full md:fixed top-[4rem] z-10 overflow-y-auto border-r border-gray-200 bg-white
          scrollbar-thin-scrollbar"
                >
                    {userNavItems && (
                        <SettingsSidebar navItems={userNavItems} />
                    )}
                </div>

                {/* Right panel */}
                <div className={`flex-1 pt-1 ${className} ml-40`}>
                    {children}
                </div>
            </div>
        </TenantRootLayout>
    );
}
