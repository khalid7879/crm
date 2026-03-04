import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import { OpportunityListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import OpportunityCreateModal from "@/Components/Tenant/Operations/Opportunities/OpportunityCreateModal";
import CommonDeleteModal from "@/Components/Tenant/Operations/Commons/commonDeleteModal";
import CommonSampleDeleteModal from "@/Components/Tenant/Operations/Commons/CommonSampleDeleteModal";

/**
 * OpportunityListPage component
 *
 * Displays a paginated list of opportunities with filtering, sorting, and actions.
 * Includes search and filtering form, data table, and pagination.
 *
 * @component
 * @returns {JSX.Element} Rendered component
 *
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function OpportunityListPage() {
    /*** -------------------------------------------------------------
     *  Initialization
     * ------------------------------------------------------------- */
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Opportunities");

    const [isModalOpenForCreate, setIsModalOpenForCreate] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [deleteData, setDeleteData] = useState([]);

    const [isModalOpenForSampleDelete, setIsModalOpenForSampleDelete] =
        useState(false);
    const [sampleData, setSampleData] = useState([]);

    const { tenant, routeNames, dataList, filterOptions, toastAlert } =
        usePage().props;

    /*** -------------------------------------------------------------
     *  Data destructuring and defaults
     * ------------------------------------------------------------- */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        from = 0,
        to = 0,
        last_page = 0,
    } = dataList || {};

    /*** -------------------------------------------------------------
     *  Form setup for filters and pagination
     * ------------------------------------------------------------- */
    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        with: "address",
        ...filterOptions,
    });

    /*** -------------------------------------------------------------
     *  Sync form data with filter options when they change
     * ------------------------------------------------------------- */
    useEffect(() => {
        const merged = { ...data, ...filterOptions };
        const keys = Object.keys(merged);
        const isDifferent = keys.some((k) => merged[k] !== data[k]);
        if (isDifferent) setData(merged);
    }, [JSON.stringify(filterOptions)]);

    /*** -------------------------------------------------------------
     *  Filter configuration
     * ------------------------------------------------------------- */
    const filterInputs = useMemo(
        () => [
            PER_PAGE({ __ }),
            ORDER_BY({ __, optValues: ["id", "name", "is_active"] }),
            ORDER_TYPE({ __ }),
            IS_ACTIVE({ __ }),
        ],
        [__]
    );

    /*** -------------------------------------------------------------
     *  Handlers
     * ------------------------------------------------------------- */
    const handleSubmit = useCallback(
        (e) => {
            e?.preventDefault?.();
            get(route(routeNames.opportunityList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    const handleSampleData = () => {
        setIsModalOpenForSampleDelete(true);
        setSampleData(null);
        router.post(
            route(routeNames.handleSampleData, {
                tenant,
                model: "OPPORTUNITY",
                action: "get",
            }),
            {
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setData((prev) => ({ ...prev, [name]: value }));
        },
        [setData]
    );

    /*** -------------------------------------------------------------
     *  Toast effect (runs once per unique message)
     * ------------------------------------------------------------- */
    useEffect(() => {
        if (toastAlert && toastAlert.sampleData) {
            setSampleData(toastAlert.sampleData ?? []);
        }
        if (toastAlert && toastAlert.deleteData) {
            setDeleteData(toastAlert.deleteData ?? []);
        }
        if (toastAlert && toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    const listPageActionButtons = [
        {
            label: "Add new",
            icon: "addPlus",
            color: "btn-success",
            onClick: () => {
                setIsModalOpenForCreate(true);
            },
        },
        {
            label: "Csv export",
            icon: "export",
            color: "btn-warning",
            onClick: () => console.log("Csv export"),
        },
        {
            label: "Pdf export",
            icon: "pdf",
            color: "btn-warning",
            onClick: () => console.log("Pdf export"),
        },
        {
            label: "Delete sample data",
            icon: "delete",
            color: "btn-warning",
            onClick: () => handleSampleData(),
        },
    ];

    const handelDeleteProcess = (id, event) => {
        event.preventDefault();

        setIsModalOpenForDelete(true);
        setDeleteData(null);
        router.post(
            route(routeNames.opportunityWiseDependency, {
                tenant,
                resourceId: id,
            }),
            {
                preserveScroll: true,
            }
        );
    };
    const actionRoute = routeNames?.opportunityDeleteWithDependency;
    const sampleDeleteRoute = routeNames?.handleSampleData;

    /*** -------------------------------------------------------------
     *  Render table rows
     * ------------------------------------------------------------- */
    const renderedRows = useMemo(() => {
        if (!allModels || allModels.length === 0) return null;

        return allModels.map((model, index) => (
            <TableTrComponent key={`opportunity_${index}`}>
                <TableCell width="w-5">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                </TableCell>

                <TableCell
                    data={model?.name}
                    isDataIcon={true}
                    dataIconLetter={model?.first_letter}
                    dataAsLink={model?.actions_links?.edit}
                />
                <TableCell data={model?.get_organization?.name} />
                <TableCell data={model?.get_last_stage?.name} />
                <TableCell data={model?.owner_name} />
                <TableCell data={model?.currency_with_amount} />
                <TableCell data={model?.forecast_date} />
                <TableCell data={model?.close_date} />
                <TableCell classPosition="text-center">
                    <div className="flex gap-2 items-center">
                        <IconComponent
                            classList="text-sm text-gray-500"
                            icon="edit"
                            link={model?.actions_links?.edit}
                        />
                        <IconComponent
                            classList="text-sm text-brandColor"
                            icon="delete"
                            callback={(event) =>
                                handelDeleteProcess(model?.id, event)
                            }
                        />
                    </div>
                </TableCell>
            </TableTrComponent>
        ));
    }, [allModels]);

    /*** -------------------------------------------------------------
     *  Component Render
     * ------------------------------------------------------------- */
    return (
        <TenantDashboardLayout
            metaTitle={metaTitle}
            breadNavItems={[...OpportunityListNavItems, { name: "List" }]}
            isShowListPageActionBtns={true}
            listPageActionButtons={listPageActionButtons}
        >
            <TableCardComponent>
                {/*** Filter Form ***/}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.opportunityList}
                />

                {/*** Data Table ***/}
                <TableContainer>
                    <TableHeadComponent>
                        <TableCell width="w-5">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                            />
                        </TableCell>
                        <TableCell data={__("Name")} as="th" />
                        <TableCell data={__("Organization")} as="th" />
                        <TableCell data={__("Stage")} as="th" />
                        <TableCell data={__("Owner")} as="th" />
                        <TableCell data={__("Amount")} as="th" />
                        <TableCell data={__("Forecast Date")} as="th" />
                        <TableCell data={__("Close Date")} as="th" />
                        <TableCell classPosition="text-center" as="th">
                            <IconComponent
                                classList="text-xl text-brandColor"
                                icon="setting3"
                            />
                        </TableCell>
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {renderedRows && renderedRows.length > 0 ? (
                            renderedRows
                        ) : (
                            <DataNotFoundComponent
                                colspan={6}
                                label="No opportunities found"
                                isTable={true}
                            />
                        )}
                    </TableBodyComponent>
                </TableContainer>

                {/*** Pagination ***/}
                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                    current_page={current_page}
                />
            </TableCardComponent>

            {/* Reusable Opportunity Modal */}
            {isModalOpenForCreate && (
                <OpportunityCreateModal
                    isModalOpen={isModalOpenForCreate}
                    setIsModalOpen={setIsModalOpenForCreate}
                    relatedToType="LEAD"
                />
            )}

            {/* Opportunity delete Modal */}
            {isModalOpenForDelete && (
                <CommonDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    deleteData={deleteData}
                    actionRoute={actionRoute}
                />
            )}

            {/* Sample delete Modal */}
            {isModalOpenForSampleDelete && (
                <CommonSampleDeleteModal
                    isModalOpen={isModalOpenForSampleDelete}
                    setIsModalOpen={setIsModalOpenForSampleDelete}
                    sampleData={sampleData}
                    actionRoute={sampleDeleteRoute}
                />
            )}
        </TenantDashboardLayout>
    );
}
