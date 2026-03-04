import React from "react";

/**
 * @component OverlayEffectComponent
 * @description
 * A full-screen overlay component that applies a vibrant orange gradient with a `color` blend mode.
 * Perfect for creating warm, energetic hero sections, card hover effects, or dramatic image overlays
 * without affecting text readability when used carefully with proper contrast.
 *
 * The `mix-blend-mode: color` combined with high opacity creates a strong tint effect that
 * shifts the underlying content's colors toward orange tones while preserving luminance.
 *
 * @import OverlayEffectComponent from "@/Components/Website/Addons/OverlayEffectComponent"
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 */
export default function OverlayEffectComponent() {
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-700 mix-blend-color opacity-90 pointer-events-none" />
    );
}
