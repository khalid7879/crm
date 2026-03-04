import Joi from "joi";

export const AddProjectLinkSchema = function (__) {
    return Joi.object().keys({
        project_ids: Joi.array()
            .min(1)
            .required()
            .messages({
                "array.min": __("Please select at least one project"),
                "array.base": __("Project must be a valid selection"),
                "any.required": __("Field is required"),
            }),
    });
};

