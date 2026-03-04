import React from "react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import { useRoute } from "ziggy";
import { useTranslations } from "@/hooks/useTranslations";
import { BusinessSettingsBreadItems } from "@/utils/common/BreadcrumbNavItems";
import BusinessSettingDashboardTree from "@/Components/Tenant/GraphsAndTrees/BusinessSettingDashboardTree";

export default function SettingPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Business settings");

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...BusinessSettingsBreadItems]}
            ></Breadcrumb>
            <BusinessSettingDashboardTree />
        </TenantSettingLayout>
    );
}
