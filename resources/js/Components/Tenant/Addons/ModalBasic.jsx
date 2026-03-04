import React from "react";
import IconComponent from "@/Components/IconComponent";
import { useTranslations } from "@/hooks/useTranslations";

export default function ModalBasic({
    isOpen = false,
    setIsModalOpen = () => {},
    title = "Modal Title",
    children,
    footer = true,
    onConfirm = () => {},
    confirmText = "Confirm",
    cancelText = "Cancel",
}) {
    if (!isOpen) return null;
    const __ = useTranslations();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md animate-fadeIn p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{__(title)}</h3>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <IconComponent
                            icon="cross"
                            classList="text-sm text-error"
                        />
                    </button>
                </div>

                {/* Body */}
                <div className="mb-4">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="btn transition"
                        >
                            <IconComponent
                                icon="crossCircle"
                                classList="text-sm text-error"
                            />
                            {__(cancelText)}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="btn btn-success transition text-base-100"
                        >
                            <IconComponent
                                icon="yes"
                                classList="text-sm"
                            />
                            {__(confirmText)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
