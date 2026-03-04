import Joi from "joi";

export const AddLeadLinkSchema = function (__) {
    return Joi.object().keys({
        lead_ids: Joi.array()
            .min(1)
            .required()
            .messages({
                "array.min": __("Please select at least one lead"),
                "array.base": __("Contact must be a valid selection"),
                "any.required": __("Field is required"),
            }),
    });
};

