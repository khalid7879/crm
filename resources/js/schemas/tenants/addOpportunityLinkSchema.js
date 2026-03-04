import Joi from "joi";

export const AddOpportunityLinkSchema = function (__) {
    return Joi.object().keys({
        opportunity_ids: Joi.array()
            .min(1)
            .required()
            .messages({
                "array.min": __("Please select at least one opportunity"),
                "array.base": __("Opportunity must be a valid selection"),
                "any.required": __("Field is required"),
            }),
    });
};

