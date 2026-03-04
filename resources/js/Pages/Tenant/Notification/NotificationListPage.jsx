import React, { useEffect, useState } from "react";
import DataNotFoundComponent from "@/Components/Tenant/Common/DataNotFoundComponent";
import Breadcrumb from "@/Components/Tenant/PageComponent/BreadcrumbComponent";
import NotificationListener from "@/Components/NotificationListener";
import TenantSettingLayout from "@/Components/Tenant/TenantSettingLayout";
import { NotificationSettingNavItems } from "@/utils/common/BreadcrumbNavItems";
import ButtonComponent from "@/Components/ButtonComponent";
import { useForm, usePage } from "@inertiajs/react";
import { useTranslations } from "@/hooks/useTranslations";
import { swalToast, swalAlert } from "@/utils/toast";
import { useRoute } from "ziggy";

export default function NotificationListPage() {
    const route = useRoute();
    const __ = useTranslations();
    const metaTitle = __("Notification");

    const {
        tenant,
        routeNames,
        roles,
        notificationChannels,
        notificationEvents,
        eventWiseData,
        toastAlert,
    } = usePage().props;
    

    const { post } = useForm();
    const [notificationSettings, setNotificationSettings] = useState({});

    const handleToggleChange = (eventId, roleId, channelKey, checked) => {
        setNotificationSettings((prev) => ({
            ...prev,
            [eventId]: {
                ...(prev[eventId] || {}),
                [roleId]: {
                    ...(prev[eventId]?.[roleId] || {}),
                    [channelKey]: checked ? 1 : 0,
                },
            },
        }));
    };

    const isToggleChecked = (eventId, roleId, channelKey, defaultValue) => {
        
        return (
            notificationSettings?.[eventId]?.[roleId]?.[channelKey] ??
            defaultValue === 1
        );
    };

    

    const handleNotificationSubmit = (eventId, roleId) => {
        console.log(notificationSettings);
        
        post(
            route(routeNames.notificationSettingsStatusChange, {
                tenant,
                eventId,
                roleId,
                data: notificationSettings,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => console.log("Status updated"),
            }
        );
    };

    useEffect(() => {
        if (toastAlert && toastAlert.message) {
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
                navItems={[...NotificationSettingNavItems, { name: "List" }]}
                btnIcon="add"
                link=""
            />
            <div className="p-3 bg-white rounded-[10px]">
                {Object.keys(notificationEvents || {}).length > 0 ? (
                    Object.entries(notificationEvents).map(
                        ([eventIndex, event]) => (
                            <div key={eventIndex} className="mb-6">
                                <p className="text-lg font-semibold mb-2">
                                    {event?.name}
                                </p>

                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Role
                                            </th>
                                            {notificationChannels.map(
                                                (channel, channelIndex) => (
                                                    <th
                                                        key={channelIndex}
                                                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"
                                                    >
                                                        {channel?.label}
                                                    </th>
                                                )
                                            )}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Object.entries(roles).map(
                                            ([roleIndex, role]) => (
                                                <tr
                                                    key={roleIndex}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {role?.name}
                                                    </td>

                                                    {notificationChannels.map(
                                                        (channel, chIndex) => (
                                                            <td
                                                                key={chIndex}
                                                                className="px-6 py-4 text-center"
                                                            >
                                                                <label className="inline-flex items-center cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="sr-only peer"
                                                                        checked={isToggleChecked(
                                                                            event?.id,
                                                                            role?.id,
                                                                            channel.value,
                                                                            eventWiseData?.[
                                                                                event
                                                                                    ?.id
                                                                            ]?.[
                                                                                role
                                                                                    ?.id
                                                                            ]?.[
                                                                                channel
                                                                                    .value
                                                                            ] ??
                                                                                false
                                                                        )}
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleToggleChange(
                                                                                event?.id,
                                                                                role?.id,
                                                                                channel.value,
                                                                                e
                                                                                    .target
                                                                                    .checked
                                                                            )
                                                                        }
                                                                    />
                                                                    <div className="relative w-5 h-3 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-brandColor peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-brandColor" />
                                                                    <span className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                                                        {isToggleChecked(
                                                                            event?.id,
                                                                            role?.id,
                                                                            channel.value,
                                                                            eventWiseData?.[
                                                                                event
                                                                                    ?.id
                                                                            ]?.[
                                                                                role
                                                                                    ?.id
                                                                            ]?.[
                                                                                channel
                                                                                    .value
                                                                            ] ??
                                                                                false
                                                                        )
                                                                            ? __(
                                                                                  "Active"
                                                                              )
                                                                            : __(
                                                                                  "Inactive"
                                                                              )}
                                                                    </span>
                                                                </label>
                                                            </td>
                                                        )
                                                    )}

                                                    <td className="px-6 py-4">
                                                        <ButtonComponent
                                                            type="text"
                                                            icon="save"
                                                            text="Save"
                                                            loading={false}
                                                            onClick={() =>
                                                                handleNotificationSubmit(
                                                                    event?.id,
                                                                    role?.id
                                                                )
                                                            }
                                                            className="btn btn-sm inline-flex items-center gap-2 px-2 py-1 bg-brandColor text-white border border-gray-300 rounded-lg"
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )
                ) : (
                    <div className="text-center py-8">
                        <DataNotFoundComponent />
                    </div>
                )}
            </div>
            <NotificationListener></NotificationListener>
        </TenantSettingLayout>
    );

}
