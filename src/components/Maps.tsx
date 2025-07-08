"use client";

import axios from "axios";
import React from "react";
import mapsImage from "../app/images/WMR Aerial Map v4 2024-01.jpg";
import { useTicketAndDisplayData } from "../hooks/useFetch.js";
import AlertMessages from "@/UI/Alert";
import { Space_Grotesk, Archivo_Black } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    weight: ["600"],
});

const archivoBlack = Archivo_Black({
    subsets: ["latin"],
    weight: ["400"],
});

function formatTimeFromISOString(isoString, options = {}) {
    const date = new Date(isoString);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        ...options,
    });
}

export default function Maps({ params }) {

    const { ticketDetails, isTicketLoading, ticketError } =
        useTicketAndDisplayData(params.id);

    if (isTicketLoading) {
        return <div className="text-white text-center mt-10">Loading...</div>;
    }

    if (ticketError) {
        return (
            <div className="text-center mt-10 text-red-500">
                Error loading ticket.
            </div>
        );
    }

    const ticket = ticketDetails.ticket;
    const ticketType = ticketDetails.ticketType;
    const contact = ticketDetails.contact;
    const event = ticketDetails.event;
    const promoter = ticketDetails.promoter;
    const location = ticketDetails.location;
    const sponsors = ticketDetails.sponsors;
    const primarySponsors = ticketDetails.primarySponsors;
    const qrCode = ticketDetails.qrCode;
    const eventSchedules = ticketDetails.eventSchedules;
    const alertMessageList = ticketDetails.eventAlerts;

    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = promoter?.logo ? `${promoter.logo}` : "";
    const locationMap = event?.map ? `${event.map}` : "";
    const qr = qrCode ? `${qrCode}` : "";

    console.log(alertMessageList);
    return (
        <>

            <div className="flex flex-col items-start justify-start min-h-screen bg-[#212121] relative top-0">
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />
                )}

                <div
                    className="flex justify-between items-start flex-1 w-full min-h-0 pb-10"
                    style={{
                        maxWidth: 690,
                        position: "relative",
                        left: "50%",
                        transform: "translate(-50%, 0)",
                        minHeight: 0,
                        backgroundImage: eventImage
                            ? `linear-gradient(to top, rgba(0,0,0,1) 70%, rgba(0,0,0,0.2) 80%), url('${eventImage}')`
                            : undefined,
                        backgroundSize: "contain",
                        backgroundPosition: "top center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <div className="shadow-2xl w-full p-4 md:p-12 lg:p-14">
                        <div className="flex items-center mb-16 justify-around">
                            {eventImage && (
                                <img src={eventLogo} alt="Event Logo" className="w-16 h-16" />
                            )}
                            <div className="flex-1 text-center">
                                <h1 className={`text-sm font-bold text-white ${archivoBlack.className}`}>
                                    {event?.name || null}
                                </h1>
                                <h1 className={`text-sm font-bold text-white ${archivoBlack.className}`}>
                                    {event?.secondLine || null}
                                </h1>
                                <h1 className={`text-sm font-bold text-white ${archivoBlack.className}`}>
                                    {event?.thirdLine || null}
                                </h1>
                            </div>
                            {promoterLogo && (
                                <img
                                    src={promoterLogo}
                                    alt="Promoter Logo"
                                    className="w-16 h-16 "
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-center items-center w-full mb-2">
                                <div className="bg-[#E53935] rounded-[0.6rem] w-full py-[0.4rem] flex justify-center items-center">
                                    <span className={`text-white text-xs font-bold uppercase tracking-wider ${archivoBlack.className}`}>
                                        Maps
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 items-center w-full">
                                <div className="w-full flex flex-col gap-2 justify-center items-center">
                                    <div className="bg-white rounded-xl shadow-md flex-1 flex justify-center items-center w-full min-h-[200px]">
                                        {locationMap ? (
                                            <img
                                                src={locationMap}
                                                alt="Map of Location"
                                                className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-white"
                                                style={{ width: "100%", backgroundColor: "#fff" }}
                                            />
                                        ) : (
                                            <span className="text-gray-500 italic">
                                                Map of the location
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-white rounded-xl shadow-md flex-1 flex justify-center items-center w-full min-h-[200px]">
                                        <img
                                            src={mapsImage.src}
                                            alt="Aerial Map"
                                            className="w-full h-auto object-contain rounded-lg border border-gray-200 bg-white"
                                            style={{ width: "100%", backgroundColor: "#fff" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}