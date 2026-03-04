import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function HeroSlider() {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <div className="flame-border-wrapper">
                <div
                    id="sliderContainer"
                    className="relative z-10 rounded-2xl "
                >
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={20}
                        loop={true}
                        pagination={{ clickable: true }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        speed={1500}
                        modules={[Pagination, Autoplay]}
                        className="w-full max-w-md"
                    >
                        <SwiperSlide className="rounded-2xl ">
                            <div className="backdrop-blur-sm bg-white/30  rounded-2xl w-full p-8 text-center cursor-pointer font-handwritten flex items-center">
                                <img
                                    className="w-40 h-40 rounded-full"
                                    src="https://metricserp.com/wp-content/uploads/2024/05/pngwing.com-9-1006x1024.webp"
                                    alt="Example Image"
                                />
                                <h3 className="text-white text-center text-3xl text-shadow-base-100">
                                    Helping you manage your business
                                </h3>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="rounded-2xl ">
                            <div className="backdrop-blur-sm bg-white/30  rounded-2xl w-full p-8 text-center cursor-pointer font-handwritten flex items-center">
                                <img
                                    className="w-40 h-40 rounded-full"
                                    src="https://www.pngall.com/wp-content/uploads/15/Artificial-Intelligence-AI-PNG-Photos.png"
                                    alt="Example Image"
                                />
                                <h3 className="text-white text-center text-3xl text-shadow-base-100">
                                    AI powered business automation
                                </h3>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </div>
    );
}
