import React, { useState } from "react";
import { useRoute } from "ziggy";
import { router, usePage } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import ContactReport from "@/Components/Tenant/Reports/ContactReport";
import ParentTaskReport from "@/Components/Tenant/Reports/ParentTaskReport";
import LeadContactReport from "@/Components/Tenant/Reports/LeadContactReport";
import OrganizationContactReport from "@/Components/Tenant/Reports/OrganizationContactReport";
import OpportunityReport from "@/Components/Tenant/Reports/OpportunityReport";
import OrganizationReport from "@/Components/Tenant/Reports/OrganizationReport";
import ProjectReport from "@/Components/Tenant/Reports/ProjectReport";
import ProductReport from "@/Components/Tenant/Reports/ProductReport";
import TaskHistoryReport from "@/Components/Tenant/Reports/TaskHistoryReport";
import LeadReport from "@/Components/Tenant/Reports/LeadReport";

export default function RelativesSectionComponent({
    needReport = [],
    addLinkBtn = false,
    showActionBtns = false,
}) {
    const page = usePage();
    const route = useRoute();
    const { model, routeNames, tenant } = page.props;
    const __ = useTranslations();

    return (
        <>
            {needReport.includes("TASK_HISTORY") && (
                <TaskHistoryReport
                    dataItems={model?.taskHistory_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("PARENT_TASK") && (
                <ParentTaskReport
                    dataItems={model?.parentTask_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("CONTACT") && (
                <ContactReport
                    dataItems={
                        model?.modelData?.contacts_report ??
                        model?.contacts_report
                    }
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("LEAD_CONTACT") && (
                <LeadContactReport
                    dataItems={model?.leads_contacts_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("LEAD") && (
                <LeadReport
                    dataItems={model?.leads_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}

            {needReport.includes("OPPORTUNITY") && (
                <OpportunityReport
                    dataItems={model?.opportunities_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("ORGANIZATION_CONTACT") && (
                <OrganizationContactReport
                    dataItems={model?.organizations_contacts_report}
                    addLinkBtn={false}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("ORGANIZATION") && (
                <OrganizationReport
                    dataItems={model?.organizations_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("PROJECT") && (
                <ProjectReport
                    dataItems={model?.projects_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
            {needReport.includes("PRODUCT") && (
                <ProductReport
                    dataItems={model?.products_report}
                    addLinkBtn={addLinkBtn}
                    showActionBtns={showActionBtns}
                />
            )}
        </>
    );
}
