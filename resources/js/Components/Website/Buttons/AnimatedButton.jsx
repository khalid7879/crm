import React from "react";
import tw from "tailwind-styled-components";
import { Link } from "@inertiajs/react";
import { useRoute } from "ziggy";

const PrimaryButton = tw(Link)`
  relative inline-block px-6 py-3 mx-2 rounded-full font-semibold text-sm 
  overflow-hidden z-10 group border transition-colors duration-300
  bg-[#d57252] text-white border-gray-300
`;

const LightButton = tw(Link)`
  relative inline-block px-6 py-3 mx-2 rounded-full font-semibold text-sm 
  overflow-hidden z-10 group border border-[1px] transition-colors duration-300
  bg-white text-black border-gray-200
`;

const Overlay = tw.span`
  absolute top-0 left-0 w-full h-full z-0 
  transition-all duration-400 ease-in-out 
  -translate-x-full group-hover:translate-x-0 bg-black
`;

const ButtonText = tw.span`
  relative z-10 group-hover:text-white
`;

const variantMap = {
    primary: PrimaryButton,
    light: LightButton,
};

export default function AnimatedButton({
    children,
    link = "",
    variant = "primary",
    ...rest
}) {
    const route = useRoute();
    const VariantWrapper = variantMap[variant] || PrimaryButton;

    let href = "#";
    try {
        href = link ? route(link) : "#";
    } catch (error) {
        console.warn("Invalid route name:", link);
    }

    return (
        <VariantWrapper href={href} {...rest}>
            <Overlay />
            <ButtonText>{children}</ButtonText>
        </VariantWrapper>
    );
}
