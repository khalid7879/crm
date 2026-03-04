import TwGeneralFormInput from "@/Components/Tenant/Forms/TwGeneralFormInput";
import TwGeneralFormFile from "@/Components/Tenant/Forms/TwGeneralFormFile";
import TwGeneralFormSelect from "@/Components/Tenant/Forms/TwGeneralFormSelect";
import TwGeneralFormTextarea from "@/Components/Tenant/Forms/TwGeneralFormTextarea";
import TwGeneralFormRadioGroup from "@/Components/Tenant/Forms/TwGeneralFormRadioGroup";
import TwGeneralFormDatalist from "@/Components/Tenant/Forms/TwGeneralFormDatalist";
import RsCreatableComponent from "@/Components/Tenant/Forms/RsCreatableComponent";
import RsSelectableComponent from "@/Components/Tenant/Forms/RsSelectableComponent";
import RsAsyncSelectComponent from "@/Components/Tenant/Forms/RsAsyncSelectComponent";

export const makeSection = ({
    title,
    classList = "",
    actionProps = {},
    childGridClass,
    childItems,
}) => ({
    parentSection: {
        title,
        classList,
        ...actionProps,
    },
    childGridClass,
    childItems,
});

export const makeInput = ({
    field,
    data,
    errors,
    setData,
    readOnly,
    isReadOnly,
    extraOnChange,
    ...props
}) => ({
    componentType: "TwGeneralFormInput",
    value: data[field] ?? "",
    onChange: (event) => {
        setData(field, event.target.value);
        if (extraOnChange) {
            extraOnChange(event.target.value);
        }
    },
    error: errors[field],
    isReadOnly: isReadOnly ?? readOnly ?? false,
    ...props,
});

export const makeFile = ({
    field,
    data,
    errors,
    setData,
    readOnly,
    isReadOnly,
    extraOnChange,
    ...props
}) => ({
    componentType: "TwGeneralFormFile",
    value: data[field] ?? "",
    onChange: (event) => {
        setData(field, event.target.files[0]);
        if (extraOnChange) {
            extraOnChange(event.target.files[0]);
        }
    },
    error: errors[field],
    isReadOnly: isReadOnly ?? readOnly ?? false,
    ...props,
});

export const makeSelect = ({
    field,
    data,
    errors,
    setData,
    options,
    extraOnChange,
    ...props
}) => ({
    componentType: "TwGeneralFormSelect",
    value: data[field],
    onChange: (val) => {
        setData(field, val);
        if (extraOnChange) {
            extraOnChange(val);
        }
    },
    error: errors[field],
    options,
    ...props,
});

export const makeTextarea = ({ field, data, errors, setData, ...props }) => ({
    componentType: "TwGeneralFormTextarea",
    value: data[field],
    onChange: (e) => setData(field, e.target.value),
    error: errors[field],
    ...props,
});

export const makeAsyncSelect = ({
    field,
    data,
    errors,
    setData,
    loadOptions,
    handleAsyncCall,
    getValue = (data, field) =>
        data.relatedToDataCollections?.find(
            (opt) => opt.value === data[field]
        ) || null,
    mapValue = (selected) => (selected ? selected.value : null),
    isMulti = false,
    isDisabled = false,
    ...props
}) => ({
    componentType: "RsAsyncSelectComponent",
    value: getValue(data, field),
    onChange: (selected) => setData(field, mapValue(selected)),
    loadOptions: loadOptions || handleAsyncCall,
    isMulti,
    error: errors[field],
    isDisabled,
    ...props,
});

export const makeMultiSelect = ({
    field,
    data,
    errors,
    setData,
    options,
    getValue = (data, field, options) =>
        options.filter((opt) => (data[field] ?? []).includes(opt?.value)),
    mapValue = (selected) => (selected ? selected.map((i) => i.value) : []),
    ...props
}) => ({
    componentType: "RsSelectableComponent",
    options,
    value: getValue(data, field, options),
    onChange: (selected) => setData(field, mapValue(selected)),
    error: errors[field],
    ...props,
});

export const makeNumberInput = ({
    field,
    data,
    errors,
    setData,
    min,
    max,
    step = 1,
    ...props
}) => ({
    componentType: "TwGeneralFormInput",
    type: "number",
    value: data[field] ?? "",
    error: errors[field],
    min,
    max,
    step,
    onChange: (e) => {
        const v = e.target.value;
        if (v === "") return setData(field, "");
        const n = Number(v);
        if (Number.isNaN(n)) return;
        const clamped = Math.max(min ?? n, Math.min(max ?? n, n));
        setData(field, clamped);
    },
    ...props,
});

export const makeDatalist = ({
    field,
    data,
    errors,
    setData,
    options,
    extraOnChange,
    ...props
}) => ({
    componentType: "TwGeneralFormDatalist",
    value: data[field] ?? "",
    onChange: (event) => {
        setData(field, event.target.value);
    },
    error: errors[field],
    options,
    ...props,
});

export const componentMapping = () => {
    return {
        TwGeneralFormFile,
        TwGeneralFormInput,
        TwGeneralFormSelect,
        TwGeneralFormDatalist,
        TwGeneralFormTextarea,
        RsCreatableComponent,
        TwGeneralFormRadioGroup,
        RsSelectableComponent,
        RsAsyncSelectComponent,
    };
};
