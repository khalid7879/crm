import Joi from "joi";

export const TenantAttachmentSchema = (__) => {
    const allowedExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".mp3",
        ".txt",
        ".docx",
        ".doc",
        ".ppt",
        ".pptx",
        ".webp",
        ".pdf",
        ".xlsx",
        ".xls",
        ".mp4",
    ];

    const MAX_FILE_SIZE_MB = 20;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    return Joi.object({
        attachment_file: Joi.any()
            .required()
            .custom((file, helpers) => {
                if (!file) {
                    return helpers.error("any.empty");
                }

                if (typeof file.name !== "string" || typeof file.size !== "number") {
                    return helpers.error("any.invalid");
                }

                // Check extension
                const fileName = file.name.toLowerCase();
                const validExtension = allowedExtensions.some((ext) =>
                    fileName.endsWith(ext)
                );
                if (!validExtension) {
                    return helpers.error("file.extension");
                }

                // Check file size
                if (file.size > MAX_FILE_SIZE_BYTES) {
                    return helpers.error("file.maxSize");
                }

                return file;
            })
            .messages({
                "any.required": __("File can't be empty"),
                "any.empty": __("File can't be empty"),
                "any.invalid": __("Invalid file object"),
                "file.extension": __("Invalid file type. Allowed types: ") + allowedExtensions.join(", "),
                "file.maxSize": __("File size exceeds the 20 MB limit"),
            }),
    });
};
