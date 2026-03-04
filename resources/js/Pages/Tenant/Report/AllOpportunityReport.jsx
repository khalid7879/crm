import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import {
    PER_PAGE,
    FILTER_DATE_FIELD,
    ORDER_TYPE,
    ORDER_BY,
} from "@/Components/Tenant/Filters/reportFilterInputs";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import TenantReportLayout from "@/Components/Tenant/TenantReportLayout";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import { useRoute } from "ziggy";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import PaginationComponent from "@/Components/Tenant/PageComponent/PaginationComponent";
import ButtonComponent from "@/Components/ButtonComponent";
import AdvanceFilterModal from "@/Components/Tenant/Operations/Commons/AdvanceFilterModal";

export default function AllOpportunityReport() {
    const {
        tenant,
        routeNames,
        reportData = {},
        filterOptions = {},
    } = usePage().props;
    const __ = useTranslations();
    const route = useRoute();

    const [loader, setLoader] = useState(true);
    const [allModels, setAllModels] = useState([]);
    const [callReport, setCallReport] = useState(true);
    const [isModalOpenAdvanceFilter, setIsModalOpenAdvanceFilter] =
        useState(false);
    const [defaultColumns, setDefaultColumns] = useState([]);
    const [amountRange, setAmountRange] = useState([]);

    const reportFilterInputs = useMemo(
        () => [
            FILTER_DATE_FIELD({ __ }),
            ORDER_TYPE({ __ }),
            ORDER_BY({ __ }),
            PER_PAGE({ __ }),
        ],
        [__]
    );

    const today = new Date().toISOString().split("T")[0];

    const { data, setData, post, get, processing, clearErrors } = useForm({
        perPage: "50",
        dateField: "DATE_CREATED",
        startDate: today,
        endDate: today,
        isActive: "",
        orderBy: "id",
        orderType: "asc",
        owner: "",
        dataSource: "",
        dataCategory: "",
        stage: "",
        closeData: "",
        amountRange: "",
        overdueDate: today,
        opportunityValue: "",
        customColumn: [],
        ...filterOptions,
    });

    const {
        links = [],
        total = 0,
        current_page = 1,
        per_page = 10,
        from = 0,
        to = 0,
        last_page = 0,
    } = allModels;

    const handleFilterChange = useCallback((e) => {
        setData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }, []);
    const handleOnChange = (selected) => {
        const formatted =
            selected?.map((item) => ({
                key: item.value,
                label: item.label,
            })) || [];

        setData("customColumn", formatted);
    };

    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            setLoader(true);
            setIsModalOpenAdvanceFilter(false);
            setAllModels([]);
            fetchData();
        },
        [tenant, routeNames, get]
    );

    const fetchData = async () => {
        try {
            console.log("calling...");
            const response = await axios.get(
                route(routeNames.allOpportunityReportData, { tenant }),
                {
                    params: data,
                }
            );

            console.log("response", response);

            if (response?.data?.reportData) {
                setAllModels(response?.data?.reportData);
                setDefaultColumns(response?.data?.defaultColumns);
                setData("customColumn", response?.data?.defaultColumns);

                setAmountRange(response?.data?.amountRange);

                setLoader(false);
            }

            setCallReport(false);
        } catch (err) {
            console.error("Error fetching report data:", err);
        }
    };
    useEffect(() => {
        if (callReport) {
            fetchData();
        }

        if (reportData && reportData?.data) {
            setAllModels(reportData);
            setCallReport(false);
            setLoader(false);
        }
    }, [reportData, routeNames, post, callReport, tenant]);
    const advanceFilter = () => {
        setIsModalOpenAdvanceFilter(true);
    };

    const getNested = (obj, path) => {
        return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? "-";
    };

    return (
        <TenantReportLayout metaTitle={__("Opportunity")}>
            <TableCardComponent>
                {/* Filter */}
                <FilterFormComponent
                    data={data}
                    filterInputs={reportFilterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    resetLink={routeNames.allOpportunityReport}
                />
                <ButtonComponent
                    icon="filter"
                    text="Advance filter"
                    className="btn btn-sm flex-1 bg-brandColor text-white border border-base-300 rounded-lg"
                    onClick={advanceFilter}
                />

                {/* Table */}
                <TableContainer>
                    <TableHeadComponent>
                        {defaultColumns?.map((col) => (
                            <TableCell
                                key={col.key}
                                columnKey={col.key}
                                data={__(col.label)}
                                as="th"
                                width="10%"
                            />
                        ))}
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {loader && (
                            <tr>
                                <td
                                    colSpan={defaultColumns.length}
                                    className="text-center p-4"
                                >
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        )}

                        {!loader ? (
                            allModels?.data?.length > 0 ? (
                                allModels.data.map((row) => (
                                    <TableTrComponent key={row.id}>
                                        {defaultColumns.map((col) => (
                                            <TableCell
                                                key={col.key}
                                                columnKey={col.key}
                                                data={getNested(row, col.key)}
                                            />
                                        ))}
                                    </TableTrComponent>
                                ))
                            ) : (
                                <DataNotFoundComponent
                                    colspan={defaultColumns.length}
                                    label="Data not found"
                                    isTable={true}
                                />
                            )
                        ) : null}
                    </TableBodyComponent>
                </TableContainer>

                <PaginationComponent
                    from={from}
                    to={to}
                    total={total}
                    links={links}
                    last_page={last_page}
                    current_page={current_page}
                />
            </TableCardComponent>

            {/* Advanced filter modal */}
            {isModalOpenAdvanceFilter && (
                <AdvanceFilterModal
                    data={data}
                    isModalOpen={isModalOpenAdvanceFilter}
                    setIsModalOpen={setIsModalOpenAdvanceFilter}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                    handleOnChange={handleOnChange}
                    reportType="OPPORTUNITY"
                    amountRange={amountRange}
                />
            )}
        </TenantReportLayout>
    );
}
