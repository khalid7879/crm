import React, { useRef, useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useSpring,
} from "framer-motion";
import { Link } from "@inertiajs/react";
import { useLazyImages } from "@/hooks/useLazyImages";
import { useTranslations } from "@/hooks/useTranslations";
import WhiteBtnComponent from "@/Components/Website/Buttons/WhiteBtnComponent";
import BrandBtnComponent from "@/Components/Website/Buttons/BrandBtnComponent";

/**
 * Full-screen sticky hero section with parallax image gallery animation
 *
 * @component
 * @name HeroAnimationSectionComponent
 *
 * @description
 * Creates an engaging hero section with:
 * - Left side: marketing text that elegantly fades and slides away on scroll
 * - Right side (md+): expanding image gallery with three parallax-scrolling columns
 * - Smooth spring-physics animations using Framer Motion
 * - Fullscreen lightbox when clicking any gallery image
 *
 * Features:
 * - 400vh scroll depth with sticky positioning
 * - Responsive: mobile shows only text, desktop shows split view
 * - Lazy loaded images
 * - Spring-smoothed scroll progress
 * - Clickable gallery with lightbox slider
 *
 * @example
 * ```jsx
 * <HeroAnimationSectionComponent />
 * ```
 *
 * @author Sakil Jomadder <sakil.diu.cse@gmail.com>
 * @author MH Emon <mhemon833@gmail.com>
 */
export default function HeroAnimationSectionComponent() {
    const __ = useTranslations();
    const containerRef = useRef(null);
    const navHeight = "60px";

    /* Lightbox control */
    const [activeIndex, setActiveIndex] = useState(null);

    /* Preload & get lazy-loaded image objects */
    const imagesObject = useLazyImages([
        "ofcTeam1",
        "ofcTeam2",
        "ofcTeam3",
        "ofcTeam4",
        "ofcTeam5",
        "ofcTeam6",
        "ofcTeam7",
        "ofcTeam8",
        "ofcTeam9",
    ]);

    /* Just the src strings for easier mapping */
    const imageSources = Object.values(imagesObject).map((img) => img.src);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    /* Smoothed scroll progress with spring physics */
    const progress = useSpring(scrollYProgress, {
        stiffness: 38,
        damping: 26,
        mass: 0.9,
    });

    /* Left panel animations */
    const leftOpacityTransform = useTransform(progress, [0, 0.4], [1, 0]);
    const leftXTransform = useTransform(progress, [0, 0.4], ["0%", "-15%"]);

    /* Right panel expansion + corner radius */
    const panelWidthTransform = useTransform(
        progress,
        [0, 0.5],
        ["40vw", "100vw"]
    );
    const panelRadiusTransform = useTransform(
        progress,
        [0, 0.4],
        ["28px", "0px"]
    );

    /* Image column rotation correction */
    const imageRotateTransform = useTransform(progress, [0, 0.5], [8, 0]);

    /* Different parallax speeds for each column */
    const col1Transform = useTransform(progress, [0, 1], ["25%", "-60%"]);
    const col2Transform = useTransform(progress, [0, 1], ["35%", "-75%"]);
    const col3Transform = useTransform(progress, [0, 1], ["45%", "-90%"]);

    const leftPositions = ["left-0", "left-1/3", "left-2/3"];

    /* Distribute images across 3 columns */
    const cols = [[], [], []];
    imageSources.forEach((src, idx) => {
        cols[idx % 3].push({ src, idx });
    });

    return (
        <>
            <section
                ref={containerRef}
                className="relative min-h-[150vh] md:min-h-[400vh] bg-base-100 w-full"
            >
                <div
                    style={{
                        top: navHeight,
                        height: `calc(100vh - ${navHeight})`,
                    }}
                    className="sticky w-full bg-base-100 flex flex-col md:flex-row overflow-hidden"
                >
                    {/* ================= LEFT PANEL - Marketing Text ================= */}
                    <motion.div
                        style={{
                            opacity: leftOpacityTransform,
                            x: leftXTransform,
                        }}
                        className="
                            relative w-full md:w-1/2 h-full flex flex-col justify-center
                            px-4 sm:px-8 md:px-10 lg:pl-20
                            z-20 overflow-y-auto md:overflow-visible
                        "
                    >
                        {/* Decorative background glow */}
                        <div
                            className="
                                absolute -left-12 top-1/2 -translate-y-1/2
                                w-[180px] h-[180px] md:w-[380px] md:h-[380px]
                                bg-brandColor/10 blur-[70px] md:blur-[110px]
                                rounded-full pointer-events-none -z-10
                            "
                        />

                        <div className="relative max-w-xl w-full mx-auto md:mx-0 py-6 md:py-3 flex flex-col justify-center gap-3 lg:gap-6">
                            {/* Badge */}
                            <div className="flex justify-center md:justify-start">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brandColor/10 border border-brandColor/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandColor opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brandColor" />
                                    </span>
                                    <span className="text-sm md:text-[12px] font-bold tracking-[0.15em] uppercase text-brandColor">
                                        {__("Modern ai enabled crm platform")}
                                    </span>
                                </div>
                            </div>

                            {/* Main Title */}
                            <h1 className="text-md sm:text-3xl  xl:text-5xl  font-extrabold leading-tight md:leading-[1.1] text-base-content capitalize">
                                <span className="block">
                                    {__("Choose the")}{" "}
                                    <span className="text-brandColor">
                                        {__("Flexible crm")}
                                    </span>
                                </span>
                                <span className="block mt-3 text-base-content/70 font-semibold text-sm md:text-md xl:text-[30px] capitalize italic text-shadow-2xs text-shadow-base-content/75">
                                    {__("For fast growing companies")}
                                </span>
                            </h1>

                            {/* Feature tags */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {["User-Centric", "Scalable", "Real-time"].map(
                                    (point, i) => (
                                        <div
                                            key={i}
                                            className="
                                            group relative overflow-hidden flex items-center gap-2 px-3 py-1
                                            rounded-full bg-base-200 border border-base-content/5
                                            transition-all duration-300
                                        "
                                        >
                                            <span className="absolute left-0 top-0 h-full w-[3px] bg-brandColor -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0" />
                                            <span className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-brandColor/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            <div className="relative w-1.5 h-1.5 rounded-full bg-brandColor" />
                                            <span className="relative text-[9px] md:text-[12px] font-bold uppercase opacity-80 transition-colors duration-300 group-hover:text-brandColor">
                                                {__(point)}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Short description card */}
                            <div className="group relative overflow-hidden backdrop-blur-xl bg-white/30 dark:bg-base-100/30 border border-white/40 dark:border-base-content/10 rounded-xl p-3 shadow-md transition-all duration-300">
                                <span className="absolute left-0 top-0 h-full w-[3px] bg-brandColor -translate-x-full transition-transform duration-300 ease-out group-hover:translate-x-0" />
                                <span className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-brandColor/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <p className="relative text-sm md:text-md text-base-content/80 leading-relaxed">
                                    {__(
                                        "Boost business growth with user-centric UI/UX design and scalable CRM workflows tailored for modern teams"
                                    )}
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="gap-3 pt-2 flex flex-col items-center  justify-center md:flex-row md:justify-start">
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto"
                                >
                                    <div className="w-full hover:-translate-y-1 transition">
                                        <BrandBtnComponent />
                                    </div>
                                </Link>
                                <Link
                                    href="/register"
                                    className="w-full sm:w-auto"
                                >
                                    <div className="w-full hover:-translate-y-1 transition">
                                        <WhiteBtnComponent />
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* ================= RIGHT PANEL - Parallax Gallery (desktop only) ================= */}
                    <div className="hidden md:block md:w-1/2 relative h-full">
                        <motion.div
                            style={{
                                width: panelWidthTransform,
                                borderTopLeftRadius: panelRadiusTransform,
                                borderBottomLeftRadius: panelRadiusTransform,
                            }}
                            className="absolute right-0 top-0 h-full overflow-hidden"
                        >
                            <div className="absolute inset-0 p-6">
                                <div className="relative h-[150%] -top-[15%]">
                                    {cols.map((col, colIndex) => (
                                        <motion.div
                                            key={colIndex}
                                            style={{
                                                y:
                                                    colIndex === 0
                                                        ? col1Transform
                                                        : colIndex === 1
                                                        ? col2Transform
                                                        : col3Transform,
                                                rotate: imageRotateTransform,
                                            }}
                                            className={`absolute ${leftPositions[colIndex]} w-1/3 px-3 space-y-6`}
                                        >
                                            {col.map(({ src, idx }) => (
                                                <ImageCard
                                                    key={idx}
                                                    src={src}
                                                    index={idx}
                                                    onClick={() =>
                                                        setActiveIndex(idx)
                                                    }
                                                />
                                            ))}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ================= LIGHTBOX MODAL ================= */}
            <AnimatePresence>
                {activeIndex !== null && (
                    <motion.div
                        className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) =>
                            e.target === e.currentTarget && setActiveIndex(null)
                        }
                    >
                        <motion.img
                            src={imageSources[activeIndex]}
                            className="max-w-[95vw] max-h-[85vh] rounded-xl shadow-2xl border border-white/10 object-contain"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300,
                            }}
                        />

                        <button
                            onClick={() => setActiveIndex(null)}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-orange-500 backdrop-blur-md text-white rounded-full transition-all duration-300 cursor-pointer group border border-white/20"
                            title="Close"
                        >
                            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">
                                ✕
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                setActiveIndex(
                                    (activeIndex - 1 + imageSources.length) %
                                        imageSources.length
                                )
                            }
                            className="absolute left-4 md:left-8 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-orange-500 backdrop-blur-md text-white rounded-full transition-all duration-300 cursor-pointer border border-white/20 group"
                        >
                            <span className="text-3xl group-hover:-translate-x-1 transition-transform">
                                ‹
                            </span>
                        </button>

                        <button
                            onClick={() =>
                                setActiveIndex(
                                    (activeIndex + 1) % imageSources.length
                                )
                            }
                            className="absolute right-4 md:right-8 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-orange-500 backdrop-blur-md text-white rounded-full transition-all duration-300 cursor-pointer border border-white/20 group"
                        >
                            <span className="text-3xl group-hover:translate-x-1 transition-transform">
                                ›
                            </span>
                        </button>

                        <div className="absolute bottom-8 text-white/60 text-sm font-medium tracking-widest">
                            {activeIndex + 1} / {imageSources.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

/**
 * Single image card for the parallax gallery
 *
 * @function
 * @name ImageCard
 *
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {number} [props.index=0] - Index used for colorful border rotation
 * @param {function} props.onClick - Handler for opening lightbox
 *
 * @example
 * ```jsx
 * <ImageCard src="/img.jpg" index={3} onClick={() => openLightbox(3)} />
 * ```
 */
function ImageCard({ src, index = 0, onClick }) {
    const borderColors = [
        "border-orange-400",
        "border-blue-400",
        "border-green-400",
        "border-purple-400",
        "border-pink-400",
        "border-yellow-400",
    ];

    const borderClass = borderColors[index % borderColors.length];

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className={`relative aspect-square rounded-md overflow-hidden border-8 ${borderClass} bg-base-200 group cursor-pointer`}
        >
            <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />
        </motion.div>
    );
}
