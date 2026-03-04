import React from "react";
import TableCell from "@/Components/Tenant/Tables/TableCell";
import TableContainer from "@/Components/Tenant/Tables/TableContainer";
import TableHeadComponent from "@/Components/Tenant/Tables/TableHeadComponent";
import TableBodyComponent from "@/Components/Tenant/Tables/TableBodyComponent";
import TableTrComponent from "@/Components/Tenant/Tables/TableTrComponent";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import SectionHeadingComponent from "@/Components/Tenant/Common/SectionHeadingComponent";

/**
 * StageDurationTable component
 *
 * @param dataList a list (object) of items
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function StageDurationTable({ dataList = [{}] }) {
    return (
        <div>
            <SectionHeadingComponent heading="Stage duration" />
            <TableContainer>
                <TableHeadComponent>
                    <TableCell
                        as="th"
                        charLimit={-1}
                        data="Pipeline stage name"
                    />
                    <TableCell as="th" charLimit={-1} data="Stage duration" />
                    <TableCell as="th" charLimit={-1} data="Stage start date" />
                    <TableCell as="th" charLimit={-1} data="Update by" />
                </TableHeadComponent>

                <TableBodyComponent>
                    {dataList && Object.keys(dataList).length > 0 ? (
                        Object.entries(dataList).map(([id, item], index) => {
                            return (
                                <TableTrComponent
                                    key={`stage_duration_${index}`}
                                >
                                    <TableCell
                                        charLimit={-1}
                                        data={item.name}
                                    />
                                    <TableCell
                                        charLimit={-1}
                                        data={item.duration}
                                    />
                                    <TableCell
                                        charLimit={-1}
                                        data={item.created_at}
                                    />
                                    <TableCell
                                        charLimit={-1}
                                        data={item.causer_id}
                                    />
                                </TableTrComponent>
                            );
                        })
                    ) : (
                        <DataNotFoundComponent isTable={true} />
                    )}
                </TableBodyComponent>
            </TableContainer>
        </div>
    );
}
