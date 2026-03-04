import React, { useEffect, useMemo, useState } from "react";
import {router, useForm, usePage } from "@inertiajs/react";
import Select from "react-select";
import { useRoute } from "ziggy";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import CommonFormInputComponent from "@/Components/Tenant/Forms/CommonFormInputComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TableCardComponent from "@/Components/Tenant/PageComponent/TableCardComponent";
import { TenantProductSchema } from "@/schemas/tenants/tenantProductSchema";
import { TenantProductCreateInputs } from "@/utils/forms/productInputs";
import { ProductListNavItems } from "@/utils/common/BreadcrumbNavItems";
import ResetFormButtonComponent from "@/Components/Tenant/Buttons/ResetFormButtonComponent";
import { swalToast } from "@/utils/toast";
import ButtonComponent from "@/Components/ButtonComponent";

/**
 * @component ProductEditPage
 * Product Edit Page Component
 *
 * @description
 * This component renders the product edit form within the tenant settings layout.
 * It allows administrators to update an existing product's name and assign it to a single category
 * using a dropdown powered by react-select.
 *
 * Features:
 * - Client-side validation using Joi via TenantProductSchema
 * - Integration with Inertia.js for form submission (PUT request)
 * - Pre-populates form fields with existing product data
 * - Handles category selection with proper initial value from product's categories relationship
 * - Displays toast notifications from server-side flash messages
 * - Includes reset button and loading state on submit
 * - Responsive layout using tenant-specific UI components
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author Mamun <mamunhossen149191@gmail.com>
 */

export default function ProductEditPage() {
    const route = useRoute();
    const __ = useTranslations();
    const { tenant, routeNames, products, categories, toastAlert } =
        usePage().props;

    const { data, setData, put, processing, errors, setError, clearErrors } =
        useForm({
            name: products?.name || "",
            price: products?.price || "",
            category: "",
        });

    /** Validation schema memoized to prevent re-creation on every render */
    const schema = useMemo(() => TenantProductSchema(__), [__]);

    /** Category options for react-select (with placeholder as disabled option) */
    const options = useMemo(
        () => [
            {
                value: "",
                label: __("Select Stage"), // translated placeholder
                isDisabled: true,
            },
            ...categories.map((category) => ({
                value: category.id,
                label: category.name,
            })),
        ],
        [categories, __]
    );

    /** Selected category option state for react-select */
    const [selectedOptions, setSelectedOptions] = useState(null);

    /**
     * Pre-select the current product's category when data loads
     * Assumes a product belongs to one primary category (takes first if multiple)
     */
    useEffect(() => {
        if (products?.categories?.length > 0) {
            const firstCategoryId = products.categories[0].id;
            const matchedOption = options.find(
                (opt) => opt.value === firstCategoryId
            );

            if (matchedOption) {
                setSelectedOptions(matchedOption);
                setData("category", firstCategoryId);
            }
        }
    }, [products, options]);

    /** Handle category selection change */
    const handleChange = (selected) => {
        setSelectedOptions(selected);
        setData("category", selected ? selected.value : null);
    };

    /** Reset form fields to empty */
    const resetData = () => {
        setData({ name: "", price: "", category: "" });
        setSelectedOptions(null);
    };

    /** Form submission handler with client-side validation */
    const handleModelUpdate = (e) => {
        e.preventDefault();

        clearErrors();

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
                joiErrors[detail.path[0]] = detail.message;
            });
            setError(joiErrors);
            return;
        }

        put(
            route(routeNames.productsUpdate, {
                tenant,
                product: products.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Product updated successfully");
                },
                onError: (errors) => {
                    console.error("Update failed:", errors);
                },
            }
        );
    };

    /** Display toast alert from server if present (runs only once per message) */
    useEffect(() => {
        if (toastAlert?.message) {
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
        router.reload({ only: [] });
    }, [toastAlert]);

    return (
        <TenantSettingLayout>
            <Breadcrumb
                title={__("Products")}
                navItems={[...ProductListNavItems, { name: __("Edit") }]}
                btnIcon="list"
                link="tenant.products.index"
            />

            <TableCardComponent>
                <form
                    className="space-y-6"
                    onSubmit={handleModelUpdate}
                    noValidate
                >
                    {/* Product name and other defined inputs */}
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

                    {/* Category dropdown */}
                    <div>
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
                            value={selectedOptions}
                            placeholder={__("Select Category")}
                            isClearable={false}
                        />
                        {errors.category && (
                            <div className="text-red-600 text-sm mt-1">
                                {errors.category}
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="buttons flex justify-between">
                        <div>
                            <ButtonComponent
                                type="submit"
                                icon="add"
                                text={__("Update")}
                                loading={processing}
                                className="btn btn-sm btn-accent flex items-center"
                                iconClass="base-100 h-4 w-4"
                            />
                        </div>
                        <ResetFormButtonComponent method={resetData} />
                    </div>
                </form>
            </TableCardComponent>
        </TenantSettingLayout>
    );
}
