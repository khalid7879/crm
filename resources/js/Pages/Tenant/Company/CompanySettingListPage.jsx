import React, { useEffect, useMemo, } from "react";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { useTranslations } from "@/hooks/useTranslations";
import { CompanySettingNavItems } from "@/utils/common/BreadcrumbNavItems";
import { TenantCompanySettingSchema } from "@/schemas/tenants/tenantCompanySettingSchema";
import { swalAlert, swalToast } from "@/utils/toast";
import { router, useForm, usePage } from "@inertiajs/react";
import { useRoute } from "ziggy";

export default function CompanySettingListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Company setting");
    const { tenant, routeNames, companySettingList, toastAlert } =
        usePage().props;

    const schema = useMemo(() => TenantCompanySettingSchema(__), []);
    /***
     * Normalize initial list:
     * - If it's not an array, make it an empty array
     * - Pick only `type` and `value` keys
     */
    const normalizedSettings = Array.isArray(companySettingList?.data)
        ? companySettingList?.data.map((item) => ({
              type: item?.type || "",
              value: item?.value || "",
              id: item?.id || "",
              is_delete: item?.is_delete || "",
          }))
        : [];

    const { data, setData, post, processing, clearErrors, setError } = useForm({
        company_settings: normalizedSettings,
    });

    // Add a new blank setting
    const addSetting = () => {
        setData("company_settings", [
            ...data.company_settings,
            { type: "", value: "", is_delete: 1 },
        ]);
    };

    // Update field for specific index
    const updateSetting = (index, field, value) => {
        setData(
            "company_settings",
            data.company_settings.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            )
        );
    };

    // Remove a setting
    const removeSetting = (index, id = "") => {
        if (id != "") {
            handleModelDelete(id, index);
        }
        setData(
            "company_settings",
            data.company_settings.filter((_, i) => i !== index)
        );
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        const { error } = schema.validate(data.company_settings, {
            abortEarly: false,
        });

      if (error) {
          swalToast({
              type: "error",
              message: error,
          });
          return;
      }
        clearErrors();

        post(route(routeNames.companySettingsStore, { tenant }), data, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Submitted!");
            },
            onError: (errors) => {
                console.error("Update failed:", errors);
            },
        });
    };

    const handleModelDelete = (id, index) => {
        swalAlert({
            title: "Confirm Deletion",
            text: "Are you sure you want to delete this? This action cannot be undone.",
        }).then((result) => {
            if (result.isConfirmed) {
                clearErrors();
                router.delete(
                    route(routeNames.companySettingsDelete, {
                        tenant,
                        company_setting: id,
                    }),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setData(
                                "company_settings",
                                data.company_settings.filter(
                                    (_, i) => i !== index
                                )
                            );
                            console.log("lead priority deleted successfully");
                        },
                        onError: (errors) => {
                            console.error("Delete failed:", errors);
                        },
                    }
                );
            }
        });
    };

    /** Toast effect: show only once per unique message */
    useEffect(() => {
        if (toastAlert && toastAlert.message) {
            console.log(toastAlert);
            swalToast({
                ...toastAlert,
                message: __([toastAlert.message]),
            });
        }
    }, [toastAlert]);

    return (
        <TenantSettingLayout metaTitle={metaTitle}>
            <Breadcrumb
                title={metaTitle}
                navItems={[...CompanySettingNavItems]}
                btnIcon="list"
                link="tenant.company-settings.index"
            />
            <form onSubmit={handleSubmit} className="space-y-4">
                {data.company_settings.map((setting, index) => (
                    <div
                        key={index}
                        className="flex gap-2 items-center border p-2 rounded"
                    >
                        <input
                            type="text"
                            placeholder="Type"
                            value={setting.type}
                            onChange={(e) =>
                                updateSetting(index, "type", e.target.value)
                            }
                            className="input input-bordered w-1/3"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={setting.value}
                            onChange={(e) =>
                                updateSetting(index, "value", e.target.value)
                            }
                            className="input input-bordered w-1/2"
                        />
                        {setting?.is_delete == 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    removeSetting(index, setting?.id)
                                }
                                className="btn btn-error btn-sm"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addSetting}
                    className="btn btn-secondary"
                >
                    + Add Setting
                </button>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn btn-primary"
                    >
                        {__("Save Settings")}
                    </button>
                </div>
            </form>
        </TenantSettingLayout>
    );
}
