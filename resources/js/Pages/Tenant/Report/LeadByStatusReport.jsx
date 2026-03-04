import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import FilterFormComponent from "@/Components/Tenant/Filters/FilterFormComponent";
import {
    PER_PAGE,
    FILTER_DATE_FIELD,
    START_DATE,
    END_DATE,
    IS_ACTIVE,
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

export default function LeadByStatusReport() {
    const { tenant, routeNames, toastAlert } = usePage().props;
    const __ = useTranslations();
    const route = useRoute();

    const [loader, setLoader] = useState(true);
    const [allModels, setAllModels] = useState([]);
    const [callReport, setCallReport] = useState(true);

    const reportFilterInputs = useMemo(
        () => [
            FILTER_DATE_FIELD({ __ }),
            START_DATE({ __ }),
            END_DATE({ __ }),
            PER_PAGE({ __ }),
            IS_ACTIVE({ __ }),
        ],
        [__]
    );
    const today = new Date().toISOString().split("T")[0];

    const { data, setData, post, processing, clearErrors } = useForm({
        perPage: "10",
        dateField: "DATE_CREATED",
        startDate: today,
        endDate: today,
        isActive: "",
    });

    {
        /* -------------------------------
         * Filter change handler
         * -------------------------------
         */
    }
    const handleFilterChange = useCallback((e) => {
        console.log("e.target", e.target);

        setData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }, []);

    {
        /* -------------------------------
         * Filter submit
         * -------------------------------
         */
    }
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault();
            fetchData();
        },
        [tenant, routeNames, post]
    );

    {
        /* -------------------------------
         * Load initial report once
         * -------------------------------
         */
    }
    const fetchData = async () => {
        try {
            const response = await axios.post(
                route(routeNames.leadByStatusReportData, { tenant }),
                data
            );

            console.log("response", response);

            if (response?.data?.reportData) {
                setAllModels(response?.data?.reportData);
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

        // Set the report data from `toastAlert` when available
        if (toastAlert && toastAlert?.data?.reportData) {
            setAllModels(toastAlert?.data?.reportData);
            setCallReport(false);
        }
    }, [toastAlert, routeNames, post, callReport, tenant]);

    // -------------------------------
    // On toastAlert update → set reportData
    // -------------------------------

    console.log("reportData", allModels?.data);

    return (
        <TenantReportLayout metaTitle={__("Lead")}>
            <TableCardComponent>
                {/* Filter */}
                <FilterFormComponent
                    data={data}
                    filterInputs={reportFilterInputs}
                    processing={processing}
                    handleSubmit={handleSubmit}
                    handleFilterChange={handleFilterChange}
                />

                {/* Table */}
                <TableContainer>
                    <TableHeadComponent>
                        <TableCell data={__("Name")} as="th" width="10%" />
                        <TableCell data={__("Title")} as="th" width="10%" />
                        <TableCell data={__("Phone")} as="th" width="10%" />
                        <TableCell data={__("Email")} as="th" width="10%" />
                        <TableCell data={__("Details")} as="th" width="10%" />
                        <TableCell
                            data={__("Organization")}
                            as="th"
                            width="10%"
                        />
                        <TableCell data={__("Stage")} as="th" width="10%" />
                        <TableCell data={__("Time")} as="th" width="10%" />
                        <TableCell data={__("Owner")} as="th" width="10%" />
                        <TableCell data={__("Category")} as="th" width="10%" />
                        <TableCell data={__("Source")} as="th" width="10%" />
                        <TableCell data={__("Rating")} as="th" width="10%" />
                        <TableCell data={__("Priority")} as="th" width="10%" />
                        <TableCell
                            data={__("Created at")}
                            as="th"
                            width="10%"
                        />
                    </TableHeadComponent>

                    <TableBodyComponent>
                        {/* Loading State */}
                        {loader && (
                            <tr>
                                <td className="text-center p-4">
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        )}
                        {allModels?.data?.length > 0
                            ? allModels?.data.map((model, index) => (
                                  <TableTrComponent key={index}>
                                      <TableCell data={model?.nickname} />
                                      <TableCell
                                          data={model?.get_designation?.name}
                                      />
                                      <TableCell data={model?.mobile_phone} />
                                      <TableCell data={model?.email} />
                                      <TableCell data={model?.details} />
                                      <TableCell
                                          data={model?.get_organization?.name}
                                      />
                                      <TableCell
                                          data={model?.get_last_stage?.name}
                                      />
                                      <TableCell
                                          data={model?.model_time?.create_diff}
                                      />
                                      <TableCell>
                                          {model?.owner?.get_user_reference
                                              ?.routeName ? (
                                              <a
                                                  href={
                                                      model.owner
                                                          .get_user_reference
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
                                      <TableCell
                                          data={model?.get_category?.name}
                                      />
                                      <TableCell
                                          data={model?.get_lead_source?.name}
                                      />
                                      <TableCell
                                          data={model?.get_lead_rating?.name}
                                      />
                                      <TableCell
                                          data={model?.get_lead_priority?.name}
                                      />
                                      <TableCell
                                          data={
                                              model?.model_time
                                                  ?.create_date_only
                                          }
                                      />
                                  </TableTrComponent>
                              ))
                            : !loader && (
                                  <DataNotFoundComponent
                                      colspan={5}
                                      label="Data not found"
                                      isTable={true}
                                  />
                              )}
                    </TableBodyComponent>
                </TableContainer>
            </TableCardComponent>
        </TenantReportLayout>
    );
}
