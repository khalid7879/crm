import Joi from "joi";
//     const singleSchema = Joi.object({
//         type: Joi.string()
//             .max(50)
//             .required()
//             .messages({
//                 "string.empty": __("Type can not be empty"),
//                 "string.max": __("Maximum character length", { max: 50 }),
//             }),
//         value: Joi.string()
//             .max(50)
//             .required()
//             .messages({
//                 "string.empty": __("Value can not be empty"),
//                 "string.max": __("Maximum character length", { max: 50 }),
//             }),
//     });

//     return Joi.array().items(singleSchema);
// };
export const TenantCompanySettingSchema = function (__) {
    const singleSchema = Joi.object({
        type: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
                "string.empty": __("Type and value can not be empty"),
                "string.min": __("Minimum character length", { min: 3 }),
                "string.max": __("Maximum character length", { max: 50 }),
            }),
        value: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
                "string.empty": __("Type and value can not be empty"),
                "string.min": __("Minimum character length", { min: 3 }),
                "string.max": __("Maximum character length", { max: 50 }),
            }),
    }).unknown(true); // ✅ allow id and is_delete without validation

    return Joi.array().items(singleSchema);
};

