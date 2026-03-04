import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage, Head, Link } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { OrganizationListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
import OrganizationCreateModal from "@/Components/Tenant/Operations/Organizations/OrganizationCreateModal";
import CommonDeleteModal from "@/Components/Tenant/Operations/Commons/commonDeleteModal";
import CommonSampleDeleteModal from "@/Components/Tenant/Operations/Commons/CommonSampleDeleteModal";

/**
 * Opportunity list page
 *
 * @author Mamun Hossen
 */
export default function OrganizationListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Organizations");
    const { tenant, routeNames, dataList, filterOptions } = usePage().props;
    const { toastAlert } = usePage().props;
    const [isModalOpenForCreate, setIsModalOpenForCreate] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [deleteData, setDeleteData] = useState([]);

    const [isModalOpenForSampleDelete, setIsModalOpenForSampleDelete] =
        useState(false);
    const [sampleData, setSampleData] = useState([]);

    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = dataList;

    const {
        data,
        setData,
        get,
        post,
        processing,
        errors,
        setError,
        clearErrors,
    } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        with: "address",
        ...filterOptions,
    });
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions]);

    const filterInputs = useMemo(
        () => [
            PER_PAGE({ __ }),
            ORDER_BY({
                __,
                optValues: ["id", "name", "is_active"],
            }),
            ORDER_TYPE({ __ }),
            IS_ACTIVE({ __ }),
        ],
        [__]
    );

    const handleLeadStatusChange = (id) => {
        post(
            route(routeNames.organizationChangeStage, {
                tenant,
                leadId: id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => console.log("Status updated successfully!"),
            }
        );
    };
    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.sampleData) {
            setSampleData(toastAlert.sampleData ?? []);
        }
        if (toastAlert && toastAlert.deleteData) {
            setDeleteData(toastAlert.deleteData ?? []);
        }
        /** Show toast alerts from server */

        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
                position: "bottom-start",
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.organizationList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames]
    );

    const handleSampleData = () => {
        setIsModalOpenForSampleDelete(true);
        setSampleData(null);
        router.post(
            route(routeNames.handleSampleData, {
                tenant,
                model: "ORGANIZATION",
                action: "get",
            }),
            {
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = useCallback((e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const listPageActionButtons = [
        {
            label: "Add new",
            icon: "addPlus",
            color: "btn-success",
            onClick: () => {
                console.log("Add clicked");
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
            route(routeNames.organizationWiseDependency, {
                tenant,
                resourceId: id,
            }),
            {
                preserveScroll: true,
            }
        );
    };

    const actionRoute = routeNames?.organizationDeleteWithDependency;
    const sampleDeleteRoute = routeNames?.handleSampleData;

    return (
        <TenantDashboardLayout
            metaTitle={metaTitle}
            breadNavItems={[...OrganizationListNavItems, { name: "List" }]}
            isShowListPageActionBtns={true}
            listPageActionButtons={listPageActionButtons}
        >
            <TableCardComponent>
                {/*** ------------------------------
                 * Filter Form
                 * ------------------------------ */}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.organizationList}
                />
                <TableContainer>
                    {/* head */}
                    <TableHeadComponent>
                        <TableCell width="w-5">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                            />
                        </TableCell>
                        <TableCell data={__("Name")} as="th" />
                        <TableCell data={__("Phone")} as="th" />
                        <TableCell data={__("Owner")} as="th" />
                        <TableCell data={__("Website")} as="th" />
                        <TableCell data={__("Description")} as="th" />
                        <TableCell data={__("Created at")} as="th" />
                        <TableCell classPosition="text-center">
                            <IconComponent
                                classList="text-xl text-brandColor"
                                icon="setting3"
                            />
                        </TableCell>
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels?.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent key={`department_${index}`}>
                                    <TableCell width="w-5">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                        />
                                    </TableCell>

                                    <TableCell
                                        data={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                        dataAsLink={model?.actions_links?.edit}
                                    />

                                    <TableCell data={model?.mobile_number} />
                                    <TableCell data={model?.owner_name} />
                                    <TableCell data={model?.website} />
                                    <TableCell data={model?.description} />
                                    <TableCell
                                        data={
                                            model?.model_time?.create_date_only
                                        }
                                    />

                                    <TableCell classPosition="text-center">
                                        <div className="flex gap-2 items-center">
                                            <IconComponent
                                                classList="text-sm text-gray-500"
                                                icon="edit"
                                                link={
                                                    model?.actions_links?.edit
                                                }
                                            />
                                            <IconComponent
                                                classList="text-sm text-brandColor"
                                                icon="delete"
                                                callback={(event) =>
                                                    handelDeleteProcess(
                                                        model?.id,
                                                        event
                                                    )
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent
                                colspan={5}
                                label="No organization found"
                                isTable={true}
                            ></DataNotFoundComponent>
                        )}
                    </TableBodyComponent>
                </TableContainer>
                {/*** ------------------------------
                 * Pagination
                 * ------------------------------ */}
                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                    current_page={current_page}
                />
            </TableCardComponent>

            {/* Reusable Organization Modal */}
            {isModalOpenForCreate && (
                <OrganizationCreateModal
                    isModalOpen={isModalOpenForCreate}
                    setIsModalOpen={setIsModalOpenForCreate}
                    relatedToType="LEAD"
                />
            )}

            {/* Organization delete Modal */}
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
