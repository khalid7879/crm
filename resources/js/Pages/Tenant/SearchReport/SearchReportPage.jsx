import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import TenantSearchLayout from "@/Components/Tenant/SearchComponent/TenantSearchLayout";
import { useTranslations } from "@/hooks/useTranslations";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { swalToast } from "@/utils/toast";
import { useRoute } from "ziggy";

/**
 * LeadEditPage Component
 *
 * @author Mamun Hossen
 */
export default function SearchReportPage() {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    // const { toastAlert, tenant, routeNames, model, tenantUsers } = page.props;
    const { toastAlert, tenant, routeNames, reportData } = page.props;

    /** Default form state */

    /** Fetch task details when modal opens */

    return (
        <TenantSearchLayout>
            {/* <TenantDashboardLayout> */}
            <TableCardComponent>
                {/*** ------------------------------
                 * Data Table
                 * ------------------------------ **/}

                {/* LEADS TABLE */}
                <div className="mb-4">
                    <p className="font-semibold mb-2">Leads</p>

                    <TableContainer>
                        <TableHeadComponent>
                            <TableCell data={__("Name")} as="th" />
                            <TableCell data={__("Stage")} as="th" />
                            <TableCell data={__("Time")} as="th" />
                        </TableHeadComponent>

                        <TableBodyComponent>
                            {reportData?.leads?.length > 0 ? (
                                reportData.leads.map((lead, index) => (
                                    <TableTrComponent key={`lead_${index}`}>
                                        <TableCell data={lead?.nickname} />
                                        <TableCell
                                            data={lead?.get_last_stage?.name}
                                        />
                                        <TableCell
                                            data={lead?.model_time?.create_diff}
                                        />
                                    </TableTrComponent>
                                ))
                            ) : (
                                <DataNotFoundComponent
                                    colspan={3}
                                    label="No leads found"
                                    isTable={true}
                                />
                            )}
                        </TableBodyComponent>
                    </TableContainer>
                </div>
                <div className="mb-4">
                    <p className="font-semibold mb-2">Task</p>

                    <TableContainer>
                        <TableHeadComponent>
                            <TableCell data={__("Name")} as="th" />
                            <TableCell data={__("Stage")} as="th" />
                            <TableCell data={__("Due date")} as="th" />
                        </TableHeadComponent>

                        <TableBodyComponent>
                            {reportData?.tasks?.length > 0 ? (
                                reportData.tasks.map((task, index) => (
                                    <TableTrComponent key={`task_${index}`}>
                                        <TableCell data={task?.name} />
                                        <TableCell
                                            data={task?.get_last_stage?.name}
                                        />
                                        <TableCell data={task?.date_due} />
                                    </TableTrComponent>
                                ))
                            ) : (
                                <DataNotFoundComponent
                                    colspan={3}
                                    label="No tasks found"
                                    isTable={true}
                                />
                            )}
                        </TableBodyComponent>
                    </TableContainer>
                </div>
            </TableCardComponent>

            {/* </TenantDashboardLayout> */}
        </TenantSearchLayout>
    );
}
