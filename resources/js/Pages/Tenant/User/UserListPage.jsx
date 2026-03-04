import React, { useEffect, useMemo, useCallback, useState } from "react";
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
import { UserListNavItems } from "@/utils/common/BreadcrumbNavItems";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import UserDeleteModal from "@/Pages/Tenant/User/UserDeleteModal";
import { swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
    IS_ACTIVE,
} from "@/Components/Tenant/Filters/filterInputs";

/**
 * UserListPage
 *
 * Displays a complete, responsive list of users within the tenant settings section.
 * Includes filtering, sorting, pagination, status toggle, and action buttons (edit/delete).
 *
 * Features:
 * - Breadcrumb navigation with "Add new" button
 * - Filter form with per-page, ordering, and active status filters
 * - Responsive table with horizontal scroll support via TableCardComponent
 * - Zebra-striped table with pinned headers
 * - Inline status toggle and action buttons per row
 * - Empty state handling with DataNotFoundComponent
 * - Server-side pagination using Inertia.js
 * - Toast notifications for success/error feedback
 * - Delete confirmation modal
 *
 * Data is provided server-side via Inertia props (`usersList`, `filterOptions`, `toastAlert`).
 * All interactions (filtering, sorting, status change, delete) use Inertia requests with `preserveScroll`.
 * @component
 *
 * @returns {JSX.Element} The full user management list page wrapped in TenantSettingLayout
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */
export default function UserListPage() {
    /** Route and translation helpers */
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Users");

    /** Inertia page props */
    const { tenant, routeNames, usersList, filterOptions, toastAlert } =
        usePage().props;

    /** Destructure paginated user data from server */
    const {
        data: allModels = [],
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = usersList;

    /** Form state for filters (per page, ordering, status, etc.) */
    const { data, setData, get, post, processing } = useForm({
        perPage: 10,
        textSearch: "",
        orderBy: "id",
        orderType: "desc",
        isActive: "",
        ...filterOptions,
    });

    /** Delete modal state */
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [userData, setUserData] = useState([]);

    /** Sync server-provided filter options into form state */
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions]);

    /** Memoized filter input fields configuration */
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

    /** Handle toast notifications from server flash messages */
    useEffect(() => {
        if (toastAlert?.userData) {
            setUserData(toastAlert.userData ?? []);
        }

        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    /** Submit filter form - triggers Inertia GET request with current filters */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.usersList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames, tenant]
    );

    /** Update individual filter field value */
    const handleFilterChange = useCallback((e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    /** Toggle user active/inactive status via POST request */
    const handleModelStatusChange = (id) => {
        post(
            route(routeNames.usersStatusChange, { tenant, userId: id }),
            {},
            { preserveScroll: true }
        );
    };

    /** Open delete confirmation modal and prepare data */
    const handelDeleteProcess = (id, is_delete = "", event) => {
        event.preventDefault();
        setIsModalOpenForDelete(true);
        setUserData(null);
        router.post(route(routeNames.userWiseModel, { tenant, user: id }), {
            preserveScroll: true,
        });
    };

    /** Action buttons configuration for table rows (Edit & Delete) */
    const action = [
        {
            name: "EDIT",
            link: routeNames.usersEdit,
            params: "user",
        },
        {
            name: "DELETE",
            method: handelDeleteProcess,
        },
    ];

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            {/** Page breadcrumb with title and "Add new" button */}
            <Breadcrumb
                title={metaTitle}
                navItems={[...UserListNavItems, { name: "List" }]}
                btnIcon="add"
                link="tenant.users.create"
                iconTitle="Add new"
            />

            {/** Main table card containing filters, table, and pagination */}
            <TableCardComponent>
                {/** Filter form section */}
                <FilterFormComponent
                    data={data}
                    filterInputs={filterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.usersList}
                />

                {/** Users data table */}
                <TableComponent>
                    <TableHeadComponent>
                        <TableThComponent label={__("Name")} />
                        <TableThComponent label={__("Email")} />
                        <TableThComponent label={__("Role")} />
                        <TableThComponent label={__("Status")} />
                        <TableThComponent label={__("Department")} />
                        <TableThComponent label={__("State")} />
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
                                <TableTrComponent
                                    key={`user_${model.id || index}`}
                                >
                                    <TableTdComponent
                                        label={model?.name}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                        modelEditRouteName={
                                            routeNames.usersEdit
                                        }
                                        modelId={model?.id}
                                    />
                                    <TableTdComponent label={model?.email} />
                                    <TableTdComponent
                                        label={model?.roles?.[0]?.name || "-"}
                                    />
                                    <TableTdComponent
                                        label={model?.get_status?.isActiveText}
                                        positionClass={`justify-center [${model?.get_status?.isActiveBadge}]`}
                                        badgeClass={`${model?.get_status?.isActiveBadge}`}
                                        hasTooltip={
                                            model?.is_active == 2 ? true : false
                                        }
                                        dataTooltip={model?.get_data_tooltip}
                                    />
                                    <TableTdComponent
                                        label={
                                            model?.get_department?.name || "-"
                                        }
                                    />

                                    <TableTdComponent
                                        isActive={model?.is_active}
                                        value={model?.id}
                                        statusMethod={() =>
                                            handleModelStatusChange(model?.id)
                                        }
                                        positionClass="text-center"
                                        isDelete={
                                            model?.is_default_admin ||
                                            model?.is_active == 2
                                                ? false
                                                : true
                                        }
                                    />
                                    <TableTdComponent
                                        label={
                                            model?.model_time?.create_date ||
                                            "-"
                                        }
                                    />
                                    <TableTdComponent
                                        label={
                                            model?.model_time?.update_diff ||
                                            "-"
                                        }
                                    />
                                    <TableTdComponent
                                        action={action}
                                        value={model?.id}
                                        positionClass="text-center"
                                        isDelete={
                                            model?.is_default_admin == 1
                                                ? false
                                                : true
                                        }
                                    />
                                </TableTrComponent>
                            ))
                        ) : (
                            <TableTrComponent>
                                <TableTdComponent colSpan={7}>
                                    <DataNotFoundComponent />
                                </TableTdComponent>
                            </TableTrComponent>
                        )}
                    </TableBodyComponent>
                </TableComponent>

                {/** Pagination controls */}
                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                />
            </TableCardComponent>

            {/** Delete confirmation modal */}
            <UserDeleteModal
                isModalOpen={isModalOpenForDelete}
                setIsModalOpen={setIsModalOpenForDelete}
                userData={userData}
            />
        </TenantSettingLayout>
    );
}
