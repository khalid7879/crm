import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage, Head, Link } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { ContactListNavItems } from "@/utils/common/BreadcrumbNavItems";
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
import ContactCreateModal from "@/Components/Tenant/Operations/Contacts/ContactCreateModal";
import CommonDeleteModal from "@/Components/Tenant/Operations/Commons/commonDeleteModal";

/**
 * @component
 * ContactListPage
 *
 * React component that renders the contact management list for tenants within the dashboard.
 * It provides table-based viewing, filtering, pagination, and CRUD modals for creating and deleting contacts.
 * Uses Inertia.js for server-side data fetching and state management, along with reusable
 * table and filter components for consistent UI behavior.
 *
 * @returns {JSX.Element} The rendered contact list page with table view, filters, and modals.
 *
 * @dependencies
 * - @inertiajs/react → Provides `useForm`, `usePage`, `router` for Inertia integration.
 * - ziggy → Enables Laravel route generation via `useRoute()`.
 * - TenantDashboardLayout → Base layout for tenant dashboard pages.
 * - Table components → For rendering structured, paginated contact data.
 * - ContactCreateModal, CommonDeleteModal → Manage contact creation and deletion.
 * - useTranslations → Handles multilingual text labels.
 *
 * @state
 * @property {boolean} isModalOpenForCreate - Controls visibility of the create contact modal.
 * @property {boolean} isModalOpenForDelete - Controls visibility of the delete confirmation modal.
 * @property {Array} deleteData - Stores selected contact(s) data for deletion.
 *
 * @inertiaProps
 * @property {Object} tenant - Current tenant’s metadata.
 * @property {Object} routeNames - Collection of route names used across tenant views.
 * @property {Object} dataList - Paginated list of contacts retrieved from the backend.
 * @property {Object} filterOptions - Initial filter and sorting options.
 * @property {Object} toastAlert - Preconfigured alert data from backend.
 *
 * @form
 * @property {number} perPage - Number of contacts displayed per page.
 * @property {string} textSearch - Keyword used to filter contact list.
 * @property {string} orderBy - Column used for sorting (default: "id").
 * @property {string} orderType - Sorting direction ("asc" or "desc").
 * @property {string} isActive - Filter flag for active/inactive contacts.
 * @property {string} with - Relations to eager load with each contact (default: "address").
 *
 * @example
 * <ContactListPage />
 * @author Mamun Hossen
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */

export default function ContactListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Contacts");
    const { tenant, routeNames, dataList, filterOptions } = usePage().props;
    const { toastAlert } = usePage().props;
    const [isModalOpenForCreate, setIsModalOpenForCreate] = useState(false);
    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [deleteData, setDeleteData] = useState([]);
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
                optValues: ["id", "nickname"],
            }),
            ORDER_TYPE({ __ }),
            // IS_ACTIVE({ __ }),
        ],
        [__]
    );

    /** Toast effect: show only once per unique message */
    useEffect(() => {
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

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.contactsList, { tenant }), {
                preserveScroll: true,
            });
        },
        [get, route, routeNames]
    );
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
    ];
    const handelDeleteProcess = (id, event, isDelete = 0) => {
        event.preventDefault();
        if (isDelete == 0) {
            swalToast({
                ...toastAlert,
                message: __([
                    "Access denied: You are not allowed to delete this data.",
                ]),
            });
        }

        if (isDelete == 1) {
            setIsModalOpenForDelete(true);
            setDeleteData(null);
            router.post(
                route(routeNames.contactsWiseDependency, {
                    tenant,
                    resourceId: id,
                }),
                {
                    preserveScroll: true,
                }
            );
        }
    };
    const actionRoute = routeNames?.contactsDeleteWithDependency;

    return (
        <TenantDashboardLayout
            metaTitle={metaTitle}
            breadNavItems={[...ContactListNavItems, { name: "List" }]}
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
                    resetLink={routeNames.contactsList}
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
                        <TableCell data={__("Email")} as="th" />
                        <TableCell data={__("Mobile")} as="th" />
                        <TableCell data={__("Owner")} as="th" />
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
                                <TableTrComponent key={`contactList_${index}`}>
                                    <TableCell width="w-5">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                        />
                                    </TableCell>

                                    <TableCell
                                        data={model?.nickname}
                                        isDataIcon={true}
                                        dataIconLetter={model?.first_letter}
                                        dataAsLink={model?.actions_links?.edit}
                                    />
                                    <TableCell data={model?.email} />
                                    <TableCell data={model?.mobile_number} />
                                    <TableCell data={model?.owner_name} />
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
                                                icon={
                                                    model?.is_delete == 0
                                                        ? "notDelete"
                                                        : "delete"
                                                }
                                                callback={(event) =>
                                                    handelDeleteProcess(
                                                        model?.id,
                                                        event,
                                                        model?.is_delete
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
                                label="No contacts found"
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

            {/* Reusable Contact Modal */}
            {isModalOpenForCreate && (
                <ContactCreateModal
                    isModalOpen={isModalOpenForCreate}
                    setIsModalOpen={setIsModalOpenForCreate}
                    relatedToType="LEAD"
                />
            )}

            {/* Contact delete Modal */}
            {isModalOpenForDelete && (
                <CommonDeleteModal
                    isModalOpen={isModalOpenForDelete}
                    setIsModalOpen={setIsModalOpenForDelete}
                    deleteData={deleteData}
                    actionRoute={actionRoute}
                />
            )}
        </TenantDashboardLayout>
    );
}
