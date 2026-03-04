import Joi from "joi";
export const TenantSocialLinkSchema = function (__) {
    return Joi.object({
        socialLink: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "string.empty": __("Name can not be empty"),
            "string.min": __("Minimum character length",{ min: 3 }),
            "string.max": __("Maximum character length",{max:50}),
        }),
    });
};