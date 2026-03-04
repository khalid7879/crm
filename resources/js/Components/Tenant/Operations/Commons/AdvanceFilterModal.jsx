import React, { useState, useEffect, useMemo } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { useRoute } from "ziggy";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast } from "@/utils/toast";
import {
    PER_PAGE,
    FILTER_DATE_FIELD,
    START_DATE,
    END_DATE,
    IS_ACTIVE,
    OWNER,
    CUSTOM_COLUMN,
    DATA_SOURCE,
    DATA_PRIORITY,
    DATA_TAG,
    STAGE,
    CLOSE_DATE,
    OPPORTUNITY_VALUE,
    OVERDUE_STATUS,
    ORDER_BY,
    ORDER_TYPE,
    DATA_CATEGORY,
    DATA_RATING,
} from "@/Components/Tenant/Filters/advanceReportFilterInputs";
import axios from "axios";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";
import DualRangeSliderComponent from "@/Components/Tenant/Filters/DualRangeSliderComponent";

export default function AdvanceFilterModal({
    data,
    isModalOpen,
    setIsModalOpen,
    handleSubmit,
    handleFilterChange,
    handleOnChange,
    reportType,
    amountRange,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const { routeNames, tenant, processing } = usePage().props;
    const [filterData, setFilterData] = useState([]);
    const [callReportFilterData, setCallReportFilterData] = useState(true);

    const DUAL_RANGE_SLIDER = () => ({
        name: "amountRange",
        label: "Amount Range",
        component: (handleFilterChange, data) => (
            <DualRangeSliderComponent
                onChange={handleFilterChange}
                minAmount={amountRange?.minAmount}
                maxAmount={amountRange?.maxAmount}
            />
        ),
    });

    const fetchData = async () => {
        try {
            const response = await axios.post(
                route(routeNames.reportFilterData, { tenant }),
                { data: reportType }
            );

            console.log("response", response);

            if (response?.data?.filterData) {
                setFilterData(response?.data?.filterData);
                setCallReportFilterData(false);
                // setLoader(false);
            }
        } catch (err) {
            console.error("Error fetching report data:", err);
        }
    };
    useEffect(() => {
        if (callReportFilterData) {
            fetchData();
        }
    });

    const reportFilterInputs = useMemo(() => {
        const inputs = [
            FILTER_DATE_FIELD({ __ }),
            START_DATE({ __ }),
            END_DATE({ __ }),
            PER_PAGE({ __ }),
            ORDER_TYPE({ __ }),
            ORDER_BY({ __ }),
            IS_ACTIVE({ __ }),
            OWNER({ __ }, filterData?.tenantUsers),
        ];

        if (reportType === "LEAD") {
            inputs.push(
                DATA_SOURCE({ __ }, filterData?.dataSources),
                DATA_PRIORITY({ __ }, filterData?.dataPriorities),
                DATA_RATING({ __ }, filterData?.dataRatings),
                DATA_CATEGORY({ __ }, filterData?.dataCategories?.INDUSTRY),
                STAGE({ __ }, filterData?.dataStages?.LEAD)
            );
        }
        if (reportType === "CONTACT") {
            inputs.push(DATA_TAG({ __ }, filterData?.dataTags));
        }
        if (reportType === "TASK") {
            inputs.push(DATA_PRIORITY({ __ }, filterData?.dataPriorities));
        }
        if (reportType === "OPPORTUNITY") {
            inputs.push(
                DATA_SOURCE({ __ }, filterData?.dataSources),
                STAGE({ __ }, filterData?.dataStages?.OPPORTUNITY),
                DATA_CATEGORY({ __ }, filterData?.dataCategories?.OPPORTUNITY),
                OPPORTUNITY_VALUE({ __ }),
                OVERDUE_STATUS({ __ }),
                DUAL_RANGE_SLIDER(),
            );
        }
        if (reportType === "PROJECT") {
            inputs.push(
                STAGE({ __ }, filterData?.dataStages?.PROJECT),
                DATA_CATEGORY({ __ }, filterData?.dataCategories?.PROJECT)
            );
          
        }

        inputs.push(
            CUSTOM_COLUMN(
                { __ },
                filterData?.allColumns,
                filterData?.defaultColumns
            )
        );

        return inputs;
    }, [__, filterData, reportType]);

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Advance filter"
            handleSubmit={handleSubmit}
            confirmText="Yes"
            cancelText="Cancel"
            processing={false}
            size="xl"
            // handleReset={handleReset}
            modalType="CREATE"
            showSaveNewBtn={false}
        >
            <div className="pb-3">
                {!callReportFilterData && (
                    <form
                        onSubmit={handleSubmit}
                        className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-0 bg-base-200 rounded-lg p-3"
                    >
                        {reportFilterInputs.map(
                            ({
                                name,
                                label,
                                options,
                                component,
                                customColumnComponent,
                            }) => {
                                // Render normal filters in grid
                                if (!customColumnComponent) {
                                    return (
                                        <div key={name} className="w-full">
                                            {options && (
                                                <>
                                                    <label className="block mb-1 text-sm font-medium">
                                                        {label}
                                                    </label>
                                                    <select
                                                        name={name}
                                                        className="select select-sm w-full text-sm border border-base-300 bg-base-100 focus:ring-red-400 focus:outline-brandColor"
                                                        value={data[name] ?? ""}
                                                        onChange={
                                                            handleFilterChange
                                                        }
                                                    >
                                                        {options.map(
                                                            (
                                                                {
                                                                    optValue,
                                                                    optLabel,
                                                                },
                                                                index
                                                            ) => (
                                                                <option
                                                                    value={
                                                                        optValue
                                                                    }
                                                                    key={`${name}_${index}`}
                                                                >
                                                                    {optLabel}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </>
                                            )}

                                            {component &&
                                                component(
                                                    handleFilterChange,
                                                    data
                                                )}
                                        </div>
                                    );
                                }

                                // Render customColumnComponent as full-width row
                                return (
                                    <div
                                        key={name}
                                        className="w-full col-span-full"
                                    >
                                        {customColumnComponent({
                                            handleOnChange,
                                            data: data?.customColumn,
                                        })}
                                    </div>
                                );
                            }
                        )}
                    </form>
                )}

                {callReportFilterData && (
                    <div className="p-4 text-sm text-gray-500 italic flex items-center gap-2">
                        <LoadingSpinner /> {__("Loading data...")}
                    </div>
                )}
            </div>
        </ModalFormInputsLayout>
    );
}
