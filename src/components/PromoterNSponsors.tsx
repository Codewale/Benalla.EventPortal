"use client";

import { useTicketAndDisplayData } from "@/hooks/useFetch";
import axios from "axios";
import React from "react";
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

export default function PromoterNsopnsors({ params }) {


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
            <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />



                )}

                <div
                    className="flex justify-between items-start flex-1 w-full min-h-0 mb-[4rem]"
                    style={{
                        maxWidth: 690,
                        position: "relative",
                        left: "50%",
                        transform: "translate(-50%, 0)",
                        minHeight: 0,
                        backgroundImage: eventImage
                            ? `linear-gradient(180deg, RGBA(0,0,0,0.1) 10%, RGBA(0,0,0,1) 20%),url('${eventImage}')`
                            : undefined,
                        backgroundSize: eventImage ? '100% 100vh, contain' : undefined, // gradient height 150px
                        backgroundRepeat: 'no-repeat, no-repeat',
                        backgroundPosition: 'top center, top center',
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

                        <div className="flex flex-col gap-6 w-full mt-8">
                            {/* Event Promoters */}
                            <div className="bg-white rounded-2xl shadow-md p-4">
                                <div className={`text-[0.65rem] font-bold text-red-600 tracking-wide ${archivoBlack.className}`}>
                                    EVENT PROMOTERS
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center border-b border-t border-gray-500 p-2">
                                        <span className={`font-semibold text-gray-800 text-xs ${spaceGrotesk.className}`}>
                                            {promoter?.name || "-"}
                                        </span>
                                        {promoterLogo && (
                                            <img
                                                src={promoterLogo}
                                                alt="Promoter Logo"
                                                className="h-6 object-contain"
                                                style={{ maxWidth: 80 }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Key Sponsors */}
                            {primarySponsors?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-md p-4">
                                    <div className={`text-[0.65rem] font-bold text-red-600 tracking-wide ${archivoBlack.className}`}>
                                        KEY SPONSORS
                                    </div>
                                    <div className="flex flex-col">
                                        {primarySponsors.map(
                                            (item: { name: string; image?: string }) => (
                                                <div
                                                    key={item.name}
                                                    className="flex justify-between items-center border-b border-t border-gray-500 py-2"
                                                >
                                                    <span className={`font-semibold text-gray-800 text-xs ${spaceGrotesk.className}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-6 object-contain"
                                                            style={{ maxWidth: 80 }}
                                                        />
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Sponsors */}
                            {sponsors?.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-md p-4">
                                    <div className={`text-[0.65rem] font-bold text-red-600 tracking-wide ${archivoBlack.className}`}>
                                        SPONSORS
                                    </div>
                                    <div className="flex flex-col">
                                        {sponsors.map((item: { name: string; image?: string }) => (
                                            <div
                                                key={item.name}
                                                className="flex justify-between items-center border-b border-t border-gray-500 py-2"
                                            >
                                                <span className={`font-semibold text-gray-800 text-xs ${spaceGrotesk.className}`}>
                                                    {item.name}
                                                </span>
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-6 object-contain"
                                                        style={{ maxWidth: 80 }}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}