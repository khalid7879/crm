import Joi from "joi";

export const AddProductLinkSchema = function (__) {
    return Joi.object().keys({
        product_id: Joi.string()
            .min(1)
            .required()
            .messages({
                "string.empty": __("Product can not be empty"),
            }),
        price: Joi.string()
            .allow(null, '')
            .pattern(/^\d{1,8}(\.\d{1,2})?$/)
            .messages({
                "string.pattern.base": __("Price must be up to 8 digits and can have up to 2 decimal places"),
            }),
    });
};

