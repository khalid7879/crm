import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslations } from "@/hooks/useTranslations";
import { useRoute } from "ziggy";
import { usePage } from "@inertiajs/react";

export default function useFetchDependencies(isModalOpen, model, actionRoute) {
    const [loading, setLoading] = useState(false);
    const [dependencies, setDependencies] = useState(null);
    const [defaultData, setDefaultData] = useState(null);
    const __ = useTranslations();
    const route = useRoute();
    const page = usePage();
    const { tenant } = page.props;

    useEffect(() => {
        if (!isModalOpen) return;

        const controller = new AbortController();

        const fetchDependencies = async () => {
            setLoading(true);
            try {
                const response = await axios.post(
                    route(actionRoute, { tenant, model }),
                    {},
                    { signal: controller.signal }
                );

                if (response.data?.status === "success") {
                    setDependencies(response.data.dependencies);
                    setDefaultData(response.data.defaultData);
                } else {
                    swalToast({
                        type: "error",
                        message: __("Failed to load dependencies"),
                        position: "bottom-start",
                    });
                }
            } catch (err) {
                if (err.name !== "CanceledError" && err.name !== "AbortError") {
                    swalToast({
                        type: "error",
                        message: __("Failed to fetch data"),
                        position: "bottom-start",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDependencies();

        return () => controller.abort();
    }, [isModalOpen, tenant, model, actionRoute]);

    return { loading, dependencies, defaultData };
}
