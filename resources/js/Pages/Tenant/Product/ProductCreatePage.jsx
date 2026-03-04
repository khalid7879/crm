import React, { useEffect, useMemo, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { swalToast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantProductSchema } from "@/schemas/tenants/tenantProductSchema";
import { TenantProductCreateInputs } from "@/utils/forms/productInputs";
import { ProductListNavItems } from "@/utils/common/BreadcrumbNavItems";
import IconComponent from "@/Components/IconComponent";
import ButtonComponent from "@/Components/ButtonComponent";
import Select from "react-select";

export default function ProductCreatePage() {
    const route = useRoute();
    const __ = useTranslations();
    const { tenant, routeNames, toastAlert, categories } = usePage().props;
    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({ name: "", price: "", category: "" });

    const schema = useMemo(() => TenantProductSchema(__), []);

    const handleModelSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        console.log(data);

        const { error } = schema.validate(
            {
                name: data.name,
                price: data.price,
                category: data.category,
            },
            { abortEarly: false }
        );

        if (error) {
            const joiErrors = {};
            error.details.forEach((detail) => {
                const field = detail.path[0];
                joiErrors[field] = detail.message;
            });

            clearErrors();
            setError(joiErrors);
            return;
        }

        clearErrors();

        post(route(routeNames.productsStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
        });
    };
    const resetData = () => {
        setData({ name: "", category: "", price: "" });
    };

    const options = [
        {
            value: "",
            label: "Select category",
            isDisabled: true,
        },
        ...categories.map((module) => ({
            value: module.id,
            label: module.name,
            isDisabled: false,
        })),
    ];

    const [selectedOption, setSelectedOption] = useState(null);

    const handleChange = (selected) => {
        setSelectedOption(selected);

        const category = selected ? selected.value : null;

        setData("category", category);

        if (errors.category) {
            clearErrors("category");
        }
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
            if (toastAlert.type == "success") {
                setData({
                    name: "",
                    price: "",
                    category: "",
                });
            }
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    return (
        <TenantSettingLayout>
            <Breadcrumb
                title="Products"
                btnIcon="list"
                navItems={[...ProductListNavItems, { name: "Create" }]}
                link="tenant.products.index"
            ></Breadcrumb>
            <TableCardComponent>
                <form
                    id=""
                    className="space-y-6"
                    onSubmit={handleModelSubmit}
                    noValidate
                >
                    {/* Single Input Field */}
                    {TenantProductCreateInputs.map((field) => (
                        <CommonFormInputComponent
                            key={field.name}
                            field={field}
                            data={data}
                            errors={errors}
                            setData={setData}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    ))}
                    <Select
                        name="category"
                        options={options}
                        className={`basic-single-select ${
                            errors.category
                                ? "border border-red-500 rounded"
                                : ""
                        }`}
                        classNamePrefix="select"
                        onChange={handleChange}
                        value={selectedOption}
                    />

                    {errors.category && (
                        <div className="text-red-600 text-sm mt-1">
                            {errors.category}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="buttons flex justify-between">
                        <div>
                            <ButtonComponent
                                type="submit"
                                icon="add"
                                text="Submit"
                                loading={processing}
                                className="btn btn-sm btn-accent flex items-center"
                                iconClass="base-100 h-4 w-4"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => resetData()}
                            className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
                        >
                            <IconComponent icon="refresh" />
                        </button>
                    </div>
                </form>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
