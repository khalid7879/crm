import Joi from "joi";

export const AddContactLinkSchema = function (__) {
    return Joi.object().keys({
        contact_ids: Joi.array()
            .min(1)
            .required()
            .messages({
                "array.min": __("Please select at least one contact"),
                "array.base": __("Contact must be a valid selection"),
                "any.required": __("Field is required"),
            }),
    });
};

