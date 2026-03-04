export function joiValidation(schema, data, setError, clearErrors) {
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
        const joiErrors = error.details.reduce((acc, { path, message }) => {
            acc[path[0]] = message;
            return acc;
        }, {});

        clearErrors();
        setError(joiErrors);

        return false;
    }

    clearErrors();
    return true;
}
