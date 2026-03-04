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
import { PermissionListNavItems } from "@/utils/common/BreadcrumbNavItems";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo, useCallback } from "react";
import { useRoute } from "ziggy";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

export default function PermissionListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Permissions");
    const { tenant, routeNames, permissionsList, filterOptions } =
        usePage().props;

    const { toastAlert } = usePage().props;
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = permissionsList;

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
    const handleModelDelete = (id) => {
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
                    route(routeNames.permissionsDelete, {
                        tenant,
                        permission: id,
                    }),
                    {
                        preserveScroll: true,
                        onSuccess: (response) => {
                            // Handle success
                            console.log("Permission deleted successfully");
                        },
                        onError: (errors) => {
                            // Handle errors
                            console.error("Delete failed:", errors);
                        },
                    }
                );
            }
        });
    };
    const handleModelEdit = (id) => {
        router.get(
            route(routeNames.permissionsEdit, {
                tenant,
                permission: id,
            })
        );
    };
    const action = [
        {
            name: "EDIT",
            link: routeNames.permissionsEdit,
            params: "permission",
        },
        {
            name: "DELETE",
            method: handleModelDelete,
        },
    ];
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.permissionsList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames]
    );
    const handleFilterChange = useCallback((e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...PermissionListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.permissions.create"
                iconTitle="Add new"
            ></Breadcrumb>
            <TableCardComponent>
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.permissionsList}
                />

                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Module")} />
                        <TableThComponent label="Created at" />
                        <TableThComponent label="Updated at" />
                        <TableThComponent
                            label={__("Action")}
                            positionClass="text-center"
                        />
                    </TableHeadComponent>
                    <TableBodyComponent>
                        {allModels?.length > 0 ? (
                            allModels.map((model, index) => (
                                <TableTrComponent key={`permission_${index}`}>
                                    <TableTdComponent label={model?.name} />
                                    <TableTdComponent
                                        label={model?.module?.name}
                                    />
                                    <TableTdComponent
                                        label={
                                            model?.model_time?.create_formatted
                                        }
                                    />
                                    <TableTdComponent
                                        label={model?.model_time?.update_diff}
                                    />
                                    <TableTdComponent
                                        action={action}
                                        value={model?.id}
                                        positionClass="text-center"
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <DataNotFoundComponent></DataNotFoundComponent>
                        )}
                    </TableBodyComponent>
                </TableComponent>

                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                />
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
