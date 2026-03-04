import Joi from "joi";
export const TenantProductSchema = function (__) {
    return Joi.object({
        name: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": __("Name can not be empty"),
            "string.min": __("Minimum character length",{ min: 3 }),
            "string.max": __("Maximum character length",{max:50}),
        }),
       category: Joi.string()
        .required()
        .messages({
            "string.empty": __("Category can not be empty"),
        }),
        price: Joi.string()
        .allow(null, '')
        .pattern(/^\d{1,8}(\.\d{1,2})?$/)
        .messages({
            "string.pattern.base": __("Price must be up to 8 digits and can have up to 2 decimal places"),
        }),

    });
};