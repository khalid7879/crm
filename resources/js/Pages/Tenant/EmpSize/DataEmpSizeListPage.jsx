import React, { useEffect, useMemo, useCallback } from "react";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import TableComponent from "@/Components/Tenant/PageComponent/TableComponent";
import TableHeadComponent from "@/Components/Tenant/PageComponent/TableHeadComponent";
import TableThComponent from "@/Components/Tenant/PageComponent/TableThComponent";
import TableBodyComponent from "@/Components/Tenant/PageComponent/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/PageComponent/TableTrComponent";
import TableTdComponent from "@/Components/Tenant/PageComponent/TableTdComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import { EmpSizeListNavItems } from "@/utils/common/BreadcrumbNavItems";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

/**
 * @component
 * DataEmpSizeListPage
 *
 * @description
 * This component renders the list view for managing Employee Size records in the tenant settings.
 * It features a filterable, sortable, and paginated table displaying all employee size entries.
 * Users can:
 * - Filter by items per page, ordering, and active status
 * - Toggle the active/inactive status of an employee size
 * - Edit or delete individual employee size records
 * - Navigate to the create new employee size page
 * - View formatted creation and update timestamps
 *
 * Built with Inertia.js for seamless server-side interactions, it integrates reusable table,
 * filter, and pagination components while displaying toast notifications for feedback.
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function DataEmpSizeListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Employee size");

    const { tenant, routeNames, empSizeList, filterOptions, toastAlert } =
        usePage().props;

    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
    } = empSizeList;

    const { data, setData, get, post, processing, clearErrors } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /** Sync filter options from URL/query params on mount or when they change */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions, data, setData]);

    /** Memoized filter input configuration */
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

    /** Handle delete confirmation and execution */
    const handleModelDelete = useCallback(
        (id) => {
            swalAlert({
                title: __("Confirm Deletion"),
                text: __(
                    "Are you sure you want to delete this resource? This action cannot be undone."
                ),
                confirmButtonText: __("Yes"),
                cancelButtonText: __("Cancel"),
            }).then((result) => {
                if (result.isConfirmed) {
                    clearErrors();
                    router.delete(
                        route(routeNames.dataEmpSizesDelete, {
                            tenant,
                            emp_size: id,
                        }),
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                console.log(
                                    "Employee size deleted successfully"
                                );
                            },
                            onError: (errors) => {
                                console.error("Delete failed:", errors);
                            },
                        }
                    );
                }
            });
        },
        [__, route, routeNames, tenant, clearErrors]
    );

    /** Toggle active/inactive status */
    const handleModelStatusChange = useCallback(
        (id) => {
            post(
                route(routeNames.dataEmpSizesStatusChange, {
                    tenant,
                    empSizeId: id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        console.log("Status updated successfully!"),
                }
            );
        },
        [post, route, routeNames, tenant]
    );

    /** Action buttons configuration for each row */
    const action = useMemo(
        () => [
            {
                name: "EDIT",
                link: routeNames.dataEmpSizesEdit,
                params: "emp_size",
            },
            {
                name: "DELETE",
                method: handleModelDelete,
            },
        ],
        [routeNames, handleModelDelete]
    );

    /** Display toast alerts from Inertia page props (shown only once) */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __(toastAlert.message),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /** Submit filter form – triggers Inertia GET request */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.dataEmpSizesList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /** Update form data on filter input change */
    const handleFilterChange = useCallback(
        (e) => {
            setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        },
        [setData]
    );

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...EmpSizeListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.emp-sizes.create"
            />

            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.dataEmpSizesList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label="Created at" />
                        <TableThComponent label="Updated at" />
                        <TableThComponent
                            label={__("Status")}
                            positionClass="text-center"
                        />
                        <TableThComponent
                            label={__("Action")}
                            positionClass="text-center"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {allModels?.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent
                                    key={`empSize_${model.id ?? index}`}
                                >
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.create_date}
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.update_diff}
                                    />
                                    <TableTdComponent
                                        isActive={model?.is_active}
                                        value={model?.id}
                                        statusMethod={() =>
                                            handleModelStatusChange(model?.id)
                                        }
                                        positionClass="justify-center"
                                    />
                                    <TableTdComponent
                                        action={action}
                                        value={model?.id}
                                        positionClass="justify-center"
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent />
                        )}
                    </TableBodyComponent>
                </TableComponent>

                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    current_page={current_page}
                />
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
