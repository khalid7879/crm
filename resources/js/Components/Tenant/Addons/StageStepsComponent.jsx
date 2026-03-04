import React, { useState } from "react";
import { _subString } from "@/utils/common/helpers";
import ClickableTooltip from "./ClickableTooltip";
import IconComponent from "@/Components/IconComponent";
import ModalBasic from "@/Components/Tenant/Addons/ModalBasic";
import { useTranslations } from "@/hooks/useTranslations";
import OpportunityCreateModal from "@/Components/Tenant/Operations/Opportunities/OpportunityCreateModal";

/**
 * StageStepsComponent
 *
 * Renders a horizontal/vertical progress-like stepper for lead or opportunity
 * stages. Each stage can be clicked to trigger a change, optionally showing a
 * tooltip confirmation. The component also handles special "Disqualified" and
 * "Converted" (final) stages.
 *
 * @component
 *
 * @param {Object[]}   steps                    Object/Map of stageKey → stageData.
 * @param {string}     currentIndex             The key of the currently active stage.
 * @param {Function}   onStepClick              Callback when a step is confirmed/clicked.
 * @param {boolean}    [showStepHeader=true]    Whether to show the header line with current stage info.
 *
 * @example
 * <StageStepsComponent
 *   steps={{
 *     "1": { label: "Open", is_final_stage: false },
 *     "2": { label: "Converted", is_final_stage: true }
 *   }}
 *   currentIndex="1"
 *   onStepClick={(key) => console.log("Stage changed to", key)}
 * />
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function StageStepsComponent({
    steps = [],
    currentIndex = "",
    onStepClick = () => {},
    showStepHeader = true,
    leadId = null,
}) {
    const __ = useTranslations();
    const [openIndex, setOpenIndex] = useState(null); // Tooltip index
    const [isModalOpen, setIsModalOpen] = useState(false); // Disqualify modal
    const [isConfirmDisqualified, setIsConfirmDisqualified] = useState(false);
    const [opportunityCreateModalOpen, setOpportunityCreateModalOpen] =
        useState(false);
    const [finalStepIndex, setFinalStepIndex] = useState("");

    /** Handle user choice from the tooltip */
    const handleTooltipChoice = (choice, stepKey) => {
        setOpenIndex(null);
        const isYes = choice.toLowerCase() === "yes";

        const step = steps?.[stepKey];
        const isThisFinalStep =
            step?.is_final_stage === "1" || step?.is_final_stage === true;

        /** If step tooltip clicked no, then do nothing, just return false */
        if (!isYes) return false;

        if (isThisFinalStep) {
            /* Open opportunity creation modal when final stage is chosen */
            setFinalStepIndex(stepKey);
            setOpportunityCreateModalOpen(true);
            return;
        }
        /* Trigger parent callback for normal stage */
        onStepClick(stepKey);
    };

    /** Split steps into normal and disqualified */
    const stepEntries = Object.entries(steps);
    const disqualified = stepEntries.find(
        ([, v]) => v.label.toLowerCase() === "disqualified"
    );
    const normalSteps = stepEntries.filter(
        ([, v]) => v.label.toLowerCase() !== "disqualified"
    );

    /** Identify converted/final stage */
    const converted = normalSteps.find(([_, v]) => v.is_final_stage == 1);
    const isConvertedActive = currentIndex === converted?.[0];

    /** Render */
    return (
        <div className="w-full mb-3">
            {showStepHeader && (
                <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-2 font-semibold text-gray-500">
                    <span>
                        {__("Lead status")} :{" "}
                        {steps?.[currentIndex]?.name || ""}
                    </span>
                </div>
            )}

            <ul className="relative flex flex-col sm:flex-row w-full select-none gap-2 sm:gap-0">
                {normalSteps.map(([key, value], i) => {
                    const isActive = key === currentIndex;
                    const isCompleted =
                        normalSteps.findIndex(([k]) => k === currentIndex) > i;

                    const baseClasses = `
                        cursor-pointer flex items-center justify-center gap-2
                        relative h-7 w-full px-4 text-sm font-medium transition-all
                        ${i === 0 ? "rounded-l-2xl" : ""}
                        ${i === normalSteps.length - 1 ? "rounded-r-2xl" : ""}
                        ${
                            isActive && !isConvertedActive
                                ? "bg-brandColor text-white"
                                : ""
                        }
                        ${
                            isActive && isConvertedActive
                                ? "bg-accent text-white"
                                : ""
                        }
                        ${isCompleted ? "bg-success text-white" : ""}
                        ${
                            !isActive && !isCompleted
                                ? "bg-base-300 text-base-content"
                                : ""
                        }
                    `;

                    return (
                        <li key={key} className="flex-1 relative">
                            <ClickableTooltip
                                position="top"
                                isOpen={openIndex === i}
                                onOpen={() => setOpenIndex(i)}
                                onClose={(choice) =>
                                    handleTooltipChoice(choice, key)
                                }
                                showTooltip={!isConvertedActive || isActive}
                            >
                                <button
                                    type="button"
                                    title={value.name}
                                    className={baseClasses}
                                >
                                    {isCompleted && (
                                        <IconComponent
                                            icon="success"
                                            classList="text-lg"
                                        />
                                    )}
                                    {(isConfirmDisqualified ||
                                        disqualified?.[0] === currentIndex) && (
                                        <IconComponent
                                            icon="cross"
                                            classList="text-sm text-error"
                                        />
                                    )}
                                    {isActive && !isConvertedActive && (
                                        <div className="inline-grid *:[grid-area:1/1]">
                                            <div className="status status-success animate-ping status-lg"></div>
                                            <div className="status status-success status-lg"></div>
                                        </div>
                                    )}
                                    {isActive && isConvertedActive && (
                                        <IconComponent
                                            icon="yes"
                                            classList="text-lg text-secondary"
                                        />
                                    )}
                                    {_subString(value.label, 20)}
                                </button>
                            </ClickableTooltip>
                        </li>
                    );
                })}

                {/* Disqualified Step */}
                {!isConvertedActive && disqualified && (
                    <>
                        <li className="sm:ml-3 sm:mt-0 mt-2"></li>
                        <li
                            key="disqualified"
                            className="group relative flex-1"
                            title={disqualified[1].name}
                        >
                            {disqualified[0] === currentIndex ? (
                                <button
                                    type="button"
                                    readOnly
                                    className="btn h-7 w-full px-2 shadow-sm text-xs 
                                        bg-error text-white rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <IconComponent
                                        icon="cross"
                                        classList="text-lg"
                                    />
                                    {_subString(disqualified[1].label, 20)}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn h-7 w-7 px-1 shadow-sm text-xs 
                                        bg-error text-white rounded-2xl flex items-center justify-center"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <IconComponent
                                        icon="cross"
                                        classList="text-lg"
                                    />
                                </button>
                            )}
                        </li>
                    </>
                )}
            </ul>

            {/* Disqualify Modal */}
            <ModalBasic
                isOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                title="Disqualify lead"
                onConfirm={() => {
                    onStepClick(disqualified[0]);
                    setIsModalOpen(false);
                    setIsConfirmDisqualified(true);
                }}
                confirmText="Yes"
                cancelText="Cancel"
            >
                <p className="text-sm text-gray-600">
                    {__("Are you sure you want to disqualify this lead")}
                </p>
            </ModalBasic>

            {/* Opportunity Create Modal */}
            {opportunityCreateModalOpen && (
                <OpportunityCreateModal
                    isModalOpen={opportunityCreateModalOpen}
                    setIsModalOpen={setOpportunityCreateModalOpen}
                    finalStepInfos={{
                        stageable_id: leadId,
                        stage_id: finalStepIndex,
                        type: "LEAD",
                    }}
                />
            )}
        </div>
    );
}
