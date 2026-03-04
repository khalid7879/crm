import React, { useEffect, useMemo, useCallback, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantDashboardLayout from "@/Components/Tenant/TenantDashboardLayout";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { LeadListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import {
    PER_PAGE,
    ORDER_BY,
    ORDER_TYPE,
} from "@/Components/Tenant/Filters/filterInputs";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import CommonDeleteModal from "@/Components/Tenant/Operations/Commons/commonDeleteModal";
import CommonSampleDeleteModal from "@/Components/Tenant/Operations/Commons/CommonSampleDeleteModal";

/**
 * LeadListPage component
 *
 * Displays a paginated list of leads with filtering, sorting, and actions.
 * Includes search and filtering form, data table, and pagination.
 *
 * @component
 * @returns {JSX.Element} Rendered component
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun Hossen
 */
export default function LeadListPage() {
    /*** -------------------------------------------------------------
     *  Initialization
     * ------------------------------------------------------------- */
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Leads");
    const { tenant, routeNames, dataList, filterOptions, toastAlert } =
        usePage().props;

    const [isModalOpenForDelete, setIsModalOpenForDelete] = useState(false);
    const [deleteData, setDeleteData] = useState([]);

    const [isModalOpenForSampleDelete, setIsModalOpenForSampleDelete] =
        useState(false);
    const [sampleData, setSampleData] = useState([]);

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
    } = dataList;

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

    /*** Sync form data with filter options when they change ***/
    useEffect(() => {
        const updated = { ...data, ...filterOptions };
        if (JSON.stringify(data) !== JSON.stringify(updated)) {
            setData(updated);
        }
    }, [filterOptions]);

    /*** -------------------------------------------------------------
     *  Filter configuration
     * ------------------------------------------------------------- */
    const filterInputs = useMemo(
        () => [
            PER_PAGE({ __ }),
            ORDER_BY({
                __,
                optValues: [
                    "nickname",
                    "email",
                    "mobile_phone",
                    "fax",
                    "created_at",
                ],
            }),
            ORDER_TYPE({ __ }),
        ],
        [__]
    );

    /*** -------------------------------------------------------------
     *  Delete lead with confirmation
     * ------------------------------------------------------------- */
    const leadDelete = useCallback(
        (id) => {
            swalAlert({
                title: __("Confirm deletion"),
                text: __("Are you sure to delete this item"),
                confirmButtonText: __("Yes"),
                cancelButtonText: __("Cancel"),
            }).then((result) => {
                if (result.isConfirmed) {
                    clearErrors();
                    router.delete(
                        route(routeNames.leadsDelete, { tenant, lead: id }),
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                console.log("Deleted successfully"),
                            onError: (errors) =>
                                console.error("Delete failed:", errors),
                        }
                    );
                }
            });
        },
        [clearErrors, route, routeNames, tenant]
    );

    /*** -------------------------------------------------------------
     *  Toast message effect (runs only once per unique message)
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

    /*** -------------------------------------------------------------
     *  Event handlers
     * ------------------------------------------------------------- */
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            get(route(routeNames.leadsList, { tenant }), {
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
                model: "LEAD",
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
                router.visit(route(routeNames.leadsCreate, { tenant }));
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
        // {
        //     label: "Csv import",
        //     icon: "import",
        //     color: "btn-error",
        //     onClick: () => console.log("Csv import"),
        // },
        {
            label: "Delete sample data",
            icon: "delete",
            color: "btn-warning",
            onClick: () => handleSampleData(),
        },
    ];

    const handelDeleteProcess = (id, event) => {
        event.preventDefault();
        console.log("id==", id);

        setIsModalOpenForDelete(true);
        setDeleteData(null);
        router.post(
            route(routeNames.leadsWiseDependency, {
                tenant,
                resourceId: id,
            }),
            {
                preserveScroll: true,
            }
        );
    };
    const actionRoute = routeNames?.leadsDeleteWithDependency;
    const sampleDeleteRoute = routeNames?.handleSampleData;

    /*** -------------------------------------------------------------
     *  Component Render
     * ------------------------------------------------------------- */
    return (
        <TenantDashboardLayout
            metaTitle={metaTitle}
            breadNavItems={[...LeadListNavItems, { name: "List" }]}
            isShowListPageActionBtns={true}
            listPageActionButtons={listPageActionButtons}
        >
            {/*** ------------------------------
             * Filter Form
             * ------------------------------ */}
            <FilterFormComponent
                data={data}
                filterInputs={filterInputs}
                processing={processing}
                handleSubmit={handleSubmit}
                handleFilterChange={handleFilterChange}
                resetLink={routeNames.leadsList}
            />

            {/*** ------------------------------
             * Data Table
             * ------------------------------ */}
            <TableContainer minWidth="1600px" tableSize="xs">
                <TableHeadComponent>
                    <TableCell as="th" classPosition="w-10">
                        {" "}
                        {/* Use classPosition or minimal width */}
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                        />
                    </TableCell>
                    <TableCell
                        data={__("Name")}
                        as="th"
                        classPosition="min-w-[120px]"
                    />
                    <TableCell
                        data={__("Title")}
                        as="th"
                        classPosition="min-w-[200px]"
                    />
                    <TableCell
                        data={__("Organization")}
                        as="th"
                        classPosition="min-w-[200px]"
                    />
                    <TableCell
                        data={__("Phone")}
                        as="th"
                        classPosition="min-w-[100px]"
                    />
                    <TableCell
                        data={__("Email")}
                        as="th"
                        classPosition="min-w-[150px]"
                    />
                    <TableCell
                        data={__("Stage")}
                        as="th"
                        classPosition="min-w-[200px]"
                    />
                    <TableCell
                        data={__("Time")}
                        as="th"
                        classPosition="min-w-[200px]"
                    />
                    <TableCell
                        data={__("Owner")}
                        as="th"
                        classPosition="min-w-[200px]"
                    />
                    <TableCell as="th" classPosition="text-center w-14">
                        <IconComponent
                            classList="text-xl text-brandColor"
                            icon="setting3"
                        />
                    </TableCell>
                </TableHeadComponent>

                <TableBodyComponent>
                    {allModels?.length > 0 ? (
                        allModels.map((model, index) => (
                            <TableTrComponent key={`lead_${index}`}>
                                <TableCell classPosition="w-10">
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
                                <TableCell
                                    data={model?.get_designation?.name}
                                />
                                <TableCell
                                    data={model?.get_organization?.name}
                                />
                                <TableCell data={model?.mobile_phone} />
                                <TableCell data={model?.email} />
                                <TableCell data={model?.get_last_stage?.name} />
                                <TableCell
                                    data={model?.model_time?.create_diff}
                                />

                                {/* Owner */}
                                <TableCell>
                                    {model?.owner?.get_user_reference
                                        ?.routeName ? (
                                        <a
                                            href={
                                                model.owner.get_user_reference
                                                    .routeName
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    model.owner
                                                        .get_user_reference
                                                        ?.name || "",
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    model?.owner
                                                        ?.get_user_reference
                                                        ?.name || "",
                                            }}
                                        />
                                    )}
                                </TableCell>

                                {/* Actions */}
                                <TableCell classPosition="text-center w-10">
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
                            colspan={10}
                            label="No leads found"
                            isTable={true}
                        />
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

            {/* Lead delete Modal */}
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
