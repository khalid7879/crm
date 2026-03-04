import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { imageRegistry } from "@/utils/images";

export default function MetaData({ metaKeywords, metaDescription, metaTitle }) {
    const { faviconPath } = usePage().props;
    return (
        <Head>
            <title>{metaTitle ?? "Home"}</title>
            <meta
                head-key="description"
                name="description"
                content={metaDescription ?? "default description"}
            />
            <meta
                head-key="keywords"
                name="keywords"
                content={metaKeywords ?? "default keywords"}
            />
            <link rel="icon" type="image/png" href={faviconPath ?? null} />
            <link
                rel="preload"
                as="image"
                href={imageRegistry.logo.src}
                fetchpriority="high"
            />
            <link
                rel="preload"
                as="image"
                href={imageRegistry.hero.src}
                fetchpriority="high"
            />
        </Head>
    );
}
