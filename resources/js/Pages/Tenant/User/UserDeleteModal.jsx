import React, { useEffect, useState, useMemo } from "react";
import ModalFormInputsLayout from "@/Components/Tenant/Addons/ModalFormInputsLayout";
import { useTranslations } from "@/hooks/useTranslations";
import { useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import { useRoute } from "ziggy";
import LoadingSpinner from "@/Components/Tenant/Addons/LoadingSpinner";

export default function UserDeleteModal({
    isModalOpen,
    setIsModalOpen,
    userData,
}) {
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        contactId: userData?.contactId,
        userId: userData?.userId,
    });

    const { tenant, routeNames } = page.props;
    const handleDelete = () => {
        post(route(routeNames.userReassignOrDelete, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
        });
    };
    

    const defaultOption = {
        value: "DONTREASSIGN",
        label: "Don't Reassign",
        isDisabled: false,
    };

    const options = useMemo(
        () => [
            defaultOption,
            ...(userData?.user ?? []).map((u) => ({
                value: u.id,
                label: u.name,
                isDisabled: false,
            })),
        ],
        [userData]
    );

    const [selectedLead, setSelectedLead] = useState(defaultOption);
    const [selectedOpportunity, setSelectedOpportunity] =
        useState(defaultOption);
    const [selectedTask, setSelectedTask] = useState(defaultOption);
    const [selectedNote, setSelectedNote] = useState(defaultOption);
    const [selectedOrganization, setSelectedOrganization] =
        useState(defaultOption);
    const [selectedContact, setSelectedContact] = useState(defaultOption);

    const [selectedOwnerLead, setSelectedOwnerLead] = useState(defaultOption);
    const [selectedOwnerOpportunity, setSelectedOwnerOpportunity] =
        useState(defaultOption);
    const [selectedOwnerTask, setSelectedOwnerTask] = useState(defaultOption);
    const [selectedOwnerNote, setSelectedOwnerNote] = useState(defaultOption);
    const [selectedOwnerOrganization, setSelectedOwnerOrganization] =
        useState(defaultOption);
    const [selectedOwnerContact, setSelectedOwnerContact] =
        useState(defaultOption);

    // Reset defaults when modal opens or userData changes
    useEffect(() => {
        if (isModalOpen) {
            resetForm();
        }
    }, [userData, isModalOpen]);
    const resetForm = () => {
        const baseData = {
            contactId: userData?.contactId,
            userId: userData?.userId,
        };

        if (userData?.associate?.lead?.labelValue) {
            console.log(userData?.associate?.lead?.labelValue);
            baseData.leadUser = "DONTREASSIGN";
            setSelectedLead(defaultOption);
        }
        if (userData?.associate?.opportunity?.value) {
            baseData.opportunityUser = "DONTREASSIGN";
            setSelectedOpportunity(defaultOption);
        }
        if (userData?.associate?.task?.value) {
            baseData.taskUser = "DONTREASSIGN";
            setSelectedTask(defaultOption);
        }
        if (userData?.associate?.note?.value) {
            baseData.noteUser = "DONTREASSIGN";
            setSelectedNote(defaultOption);
        }
        if (userData?.associate?.organization?.value) {
            baseData.organizationUser = "DONTREASSIGN";
            setSelectedOrganization(defaultOption);
        }
        if (userData?.associate?.contact?.value) {
            baseData.contactUser = "DONTREASSIGN";
            setSelectedContact(defaultOption);
        }

        if (userData?.owner?.lead?.value) {
            baseData.ownerLeadUser = "DONTREASSIGN";
            setSelectedOwnerLead(defaultOption);
        }
        if (userData?.owner?.opportunity?.value) {
            baseData.ownerOpportunityUser = "DONTREASSIGN";
            setSelectedOwnerOpportunity(defaultOption);
        }
        if (userData?.owner?.task?.value) {
            baseData.ownerTaskUser = "DONTREASSIGN";
            setSelectedOwnerTask(defaultOption);
        }
        if (userData?.owner?.note?.value) {
            baseData.ownerNoteUser = "DONTREASSIGN";
            setSelectedOwnerNote(defaultOption);
        }
        if (userData?.owner?.organization?.value) {
            baseData.ownerOrganizationUser = "DONTREASSIGN";
            setSelectedOwnerOrganization(defaultOption);
        }
        if (userData?.owner?.contact?.value) {
            baseData.ownerContactUser = "DONTREASSIGN";
            setSelectedOwnerContact(defaultOption);
        }

        setData(baseData);
        clearErrors();
    };

    const handleLeadChange = (selected) => {
        setSelectedLead(selected);
        setData("leadUser", selected?.value ?? "DONTREASSIGN");
        if (errors.leadUser) clearErrors("leadUser");
    };
    const handleOpportunityChange = (selected) => {
        setSelectedOpportunity(selected);
        setData("opportunityUser", selected?.value ?? "DONTREASSIGN");
        if (errors.opportunityUser) clearErrors("opportunityUser");
    };
    const handleTaskChange = (selected) => {
        setSelectedTask(selected);
        setData("taskUser", selected?.value ?? "DONTREASSIGN");
        if (errors.taskUser) clearErrors("taskUser");
    };
    const handleNoteChange = (selected) => {
        setSelectedNote(selected);
        setData("noteUser", selected?.value ?? "DONTREASSIGN");
        if (errors.noteUser) clearErrors("noteUser");
    };
    const handleOrganizationChange = (selected) => {
        setSelectedOrganization(selected);
        setData("organizationUser", selected?.value ?? "DONTREASSIGN");
        if (errors.organizationUser) clearErrors("organizationUser");
    };
    const handleContactChange = (selected) => {
        setSelectedContact(selected);
        setData("contactUser", selected?.value ?? "DONTREASSIGN");
        if (errors.contactUser) clearErrors("contactUser");
    };

    const handleOwnerLeadChange = (selected) => {
        setSelectedOwnerLead(selected);
        setData("ownerLeadUser", selected?.value ?? "DONTREASSIGN");
        if (errors.ownerLeadUser) clearErrors("ownerLeadUser");
    };
    const handleOwnerOpportunityChange = (selected) => {
        setSelectedOwnerOpportunity(selected);
        setData("ownerOpportunityUser", selected?.value ?? "DONTREASSIGN");
        if (errors.ownerOpportunityUser) clearErrors("ownerOpportunityUser");
    };
    const handleOwnerTaskChange = (selected) => {
        setSelectedOwnerTask(selected);
        setData("ownerTaskUser", selected?.value ?? "DONTREASSIGN");
        if (errors.ownerTaskUser) clearErrors("ownerTaskUser");
    };
    const handleOwnerNoteChange = (selected) => {
        setSelectedOwnerNote(selected);
        setData("ownerNoteUser", selected?.value ?? "DONTREASSIGN");
        if (errors.ownerNoteUser) clearErrors("ownerNoteUser");
    };
    const handleOwnerOrganizationChange = (selected) => {
        setSelectedOwnerOrganization(selected);
        setData("ownerOrganizationUser", selected?.value ?? "DONTREASSIGN");
        if (errors.ownerOrganizationUser) clearErrors("ownerOrganizationUser");
    };
    const handleOwnerContactChange = (selected) => {
        setSelectedOwnerContact(selected);
        setData("ownerContactUser", selected?.value ?? "DONTREASSIGN");
        if (errors.ownerContactUser) clearErrors("ownerContactUser");
    };

    const functionMap = {
        handleLeadChange,
        handleOpportunityChange,
        handleTaskChange,
        handleNoteChange,
        handleOrganizationChange,
        handleContactChange,

        handleOwnerLeadChange,
        handleOwnerOpportunityChange,
        handleOwnerTaskChange,
        handleOwnerNoteChange,
        handleOwnerOrganizationChange,
        handleOwnerContactChange,
    };
    const valueMap = {
        selectedLead,
        selectedOpportunity,
        selectedOrganization,
        selectedTask,
        selectedNote,
        selectedContact,

        selectedOwnerLead,
        selectedOwnerOpportunity,
        selectedOwnerTask,
        selectedOwnerNote,
        selectedOwnerOrganization,
        selectedOwnerContact,
    };

    return (
        <ModalFormInputsLayout
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            title="Delete user"
            headerIcon="delete"
            confirmText="Yes"
            cancelText="Cancel"
            processing={processing}
            size="xl"
            modalType="DELETE"
            saveText={__("Yes delete the user text")}
            handleDelete={handleDelete}
        >
            <div className="space-y-4">
                {/* Instruction alert */}
                <p className="border border-red-600 rounded p-3 text-sm text-red-600">
                    {userData?.userName &&
                        __(
                            "You can reassign records that is the owner or responsible user for to other active users before is deleted",
                            { name: userData?.userName }
                        )}
                </p>
                <div className="grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-5 bg-base-100 shadow rounded-lg border border-base-300 overflow-hidden w-full lg:w-4/4">
                    {/* Associates */}
                    {userData?.associate &&
                        Object.keys(userData.associate).length > 0 &&
                        Object.values(userData.associate).map(
                            (value, index) => (
                                <div
                                    key={value.id ?? `associate-${index}`}
                                    className="border border-base-300 flex flex-col px-3 py-2"
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">
                                        {value.label}
                                    </span>
                                    <span className="text-base-content md:text-sm">
                                        {value.labelValue ?? "-"}
                                    </span>
                                </div>
                            )
                        )}

                    {/* Owners */}
                    {userData?.owner &&
                        Object.values(userData.owner).length > 0 &&
                        Object.values(userData.owner).map((value, index) => (
                            <div
                                key={`owner-${index}`}
                                className="border border-base-300 flex flex-col px-3 py-2"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wide text-base-content/50">
                                    {value.label}
                                </span>
                                <span className="text-base-content md:text-sm">
                                    {value.labelValue}
                                </span>
                            </div>
                        ))}

                    {/* Associates msg */}
                    {(!userData?.associate ||
                        userData.associate.length === 0) &&
                        (!userData?.owner || userData.owner.length === 0) &&
                        userData?.result && (
                            <div className="border border-base-300 flex items-center justify-center p-2 col-span-full">
                                <p className="text-sm text-gray-500 italic">
                                    No data available
                                </p>
                            </div>
                        )}
                    {!userData?.result && (
                        <li className="p-4 text-sm text-gray-500 italic">
                            <LoadingSpinner />
                        </li>
                    )}
                </div>

                {/* Two-column layout: Associate left, Owner right */}

                <div className="flex gap-6">
                    {/* Associate Part - left side */}
                    <div className="flex-1 space-y-4">
                        {userData?.associate &&
                            Object.keys(userData.associate).length > 0 && (
                                <p className="font-semibold">Owner</p>
                            )}

                        {userData?.associate &&
                            Object.values(userData.associate).map(
                                (item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3"
                                    >
                                        <label
                                            htmlFor={item.name}
                                            className="whitespace-nowrap font-medium"
                                        >
                                            {item.title}
                                        </label>
                                        <div className="flex-1">
                                            <Select
                                                name={item.name}
                                                options={options}
                                                className="basic-single-select"
                                                classNamePrefix="select"
                                                onChange={
                                                    functionMap[item.method]
                                                }
                                                value={valueMap[item.value]}
                                            />
                                        </div>
                                    </div>
                                )
                            )}
                    </div>

                    {/* Owner Part - right side */}
                    <div className="flex-1 space-y-4">
                        {/* Replace with your Owner content */}
                        {userData?.owner &&
                            Object.keys(userData.owner).length > 0 && (
                                <p className="font-semibold">Owner</p>
                            )}

                        {userData?.owner &&
                            Object.values(userData.owner).map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <label
                                        htmlFor={item.name}
                                        className="whitespace-nowrap font-medium"
                                    >
                                        {item.title}
                                    </label>
                                    <div className="flex-1">
                                        <Select
                                            name={item.name}
                                            options={options}
                                            className="basic-single-select"
                                            classNamePrefix="select"
                                            onChange={functionMap[item.method]}
                                            value={valueMap[item.value]}
                                        />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </ModalFormInputsLayout>
    );
}
