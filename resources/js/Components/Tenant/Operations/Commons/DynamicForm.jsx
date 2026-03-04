import React, {useMemo} from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { componentMapping } from "@/utils/common/sectionAndFieldFactory";
import FormSectionComponent from "@/Components/Tenant/Forms/FormSectionComponent";

export default function DynamicForm(formInputs) {
    const componentMap = useMemo(() => componentMapping(), []);
    const __ = useTranslations();

    const renderForm = () => (
        <form>
            {formInputs.map((section, sIdx) => (
                <FormSectionComponent
                    key={sIdx}
                    {...section.parentSection}
                    className="bg-base-100 border border-base-300 rounded-md p-3 text-base-content"
                >
                    <div className={`${section.childGridClass} py-3`}>
                        {section.childItems.map((field, idx) => {
                            const Component = componentMap[field.componentType];
                            return Component ? (
                                <Component
                                    key={`${sIdx}_${idx}`}
                                    {...field}
                                    className="bg-base-100 text-base-content border border-base-300"
                                />
                            ) : (
                                <h1
                                    key={`${sIdx}_${idx}`}
                                    className="text-error"
                                >
                                    {__("No data found")}
                                </h1>
                            );
                        })}
                    </div>
                </FormSectionComponent>
            ))}
        </form>
    );

    return { renderForm };
}
