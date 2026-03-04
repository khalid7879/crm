import Joi from "joi";

export const AddOrganizationLinkSchema = function (__) {
    return Joi.object().keys({
        organization_ids: Joi.array()
            .min(1)
            .required()
            .messages({
                "array.min": __("Please select at least one organization"),
                "array.base": __("Organization must be a valid selection"),
                "any.required": __("Field is required"),
            }),
    });
};

