"use client";

import axios from "axios";
import React from "react";

import { useTicketAndDisplayData } from "@/hooks/useFetch";
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

export default function TicketLinksnOpenings({ params }) {

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
    const ticketLinks = ticketDetails.ticketLinks;
    const alertMessageList = ticketDetails.eventAlerts;

    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = promoter?.logo ? `${promoter.logo}` : "";
    const locationMap = event?.map ? `${event.map}` : "";
    const qr = qrCode ? `${qrCode}` : "";

    const getLinksByType = (type) =>
        ticketLinks.filter((link) => link.typeLabel === type);

    console.log(ticketLinks);
    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen bg-[#212121] relative top-0">
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />


                )}

                <div
                    className="flex justify-between items-start flex-1 w-full min-h-0"
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
                    {/* Ticket Links Table */}
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
                        <div className="flex flex-col items-center justify-start w-full gap-2">
                            {getLinksByType("Information").length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg w-full md:w-1/2 p-3 mb-4 ">
                                    <table className="w-full">
                                        <tbody>
                                            {getLinksByType("Information").map((item) => (
                                                <React.Fragment key={item.displayOrder}>
                                                    {/* Heading row */}
                                                    <tr>
                                                        <td colSpan={2} className="py-0.5 text-center">
                                                            <span className={`font-bold text-[0.65rem] uppercase text-red-700 ${archivoBlack.className}`}>
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Image and link row */}
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-1 pr-2 align-top w-12">
                                                            {item.ticketLinkImage ? (
                                                                <img
                                                                    src={item.ticketLinkImage}
                                                                    alt={item.name}
                                                                    className="w-8 h-8 object-contain rounded"
                                                                />
                                                            ) : (
                                                                <div className={`w-8 h-8 bg-gray-200 flex items-center justify-center rounded text-gray-400 text-lg ${spaceGrotesk.className}`}>
                                                                    <span>?</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-1 align-top">
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[0.65rem] text-black font-semibold break-all no-underline"
                                                                style={{ textDecoration: "none" }}
                                                            >
                                                                {item.url}
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Section for "Document" ticket links */}
                            {getLinksByType("Document").length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg w-full md:w-1/2 p-3 mb-4 ">
                                    <table className="w-full">
                                        <tbody>
                                            {getLinksByType("Document").map((item) => (
                                                <React.Fragment key={item.displayOrder}>
                                                    {/* Heading row */}
                                                    <tr>
                                                        <td colSpan={2} className="py-0.5 text-center">
                                                            <span className={`font-bold text-[0.65rem] uppercase text-red-700 ${archivoBlack.className}`}>
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Image and link row */}
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-1 pr-2 align-top w-12">
                                                            {item.ticketLinkImage ? (
                                                                <img
                                                                    src={item.ticketLinkImage}
                                                                    alt={item.name}
                                                                    className="w-8 h-8 object-contain rounded"
                                                                />
                                                            ) : (
                                                                <div className={`w-8 h-8 bg-gray-200 flex items-center justify-center rounded text-gray-400 text-lg ${spaceGrotesk.className}`}>
                                                                    <span>?</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-1 align-top">
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[0.65rem] text-black font-semibold break-all no-underline"
                                                                style={{ textDecoration: "none" }}
                                                            >
                                                                {item.url}
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Section for "Advertisement" ticket links */}
                            {getLinksByType("Advertisement").length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg w-full md:w-1/2 p-3 mb-4 ">
                                    <table className="w-full">
                                        <tbody>
                                            {getLinksByType("Advertisement").map((item) => (
                                                <React.Fragment key={item.displayOrder}>
                                                    {/* Heading row */}
                                                    <tr>
                                                        <td colSpan={2} className="py-0.5 text-center">
                                                            <span className={`font-bold text-[0.65rem] uppercase text-red-700 ${archivoBlack.className}`}>
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Image and link row */}
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-1 pr-2 align-top w-12">
                                                            {item.ticketLinkImage ? (
                                                                <img
                                                                    src={item.ticketLinkImage}
                                                                    alt={item.name}
                                                                    className="w-8 h-8 object-contain rounded"
                                                                />
                                                            ) : (
                                                                <div className={`w-8 h-8 bg-gray-200 flex items-center justify-center rounded text-gray-400 text-lg ${spaceGrotesk.className}`}>
                                                                    <span>?</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-1 align-top">
                                                            <a
                                                                href={item.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[0.65rem] text-black font-semibold break-all no-underline"
                                                                style={{ textDecoration: "none" }}
                                                            >
                                                                {item.url}
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Opening Hours Card */}
                            <div className="bg-white rounded-xl shadow-lg w-full md:w-1/2 p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className={`text-red-700 text-[0.55rem] uppercase font-semibold ${archivoBlack.className}`}>
                                            {event?.openingHours?.tyreBranding} Tyre Hours
                                        </div>
                                        <div className={`text-gray-900 text-[0.7rem] font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.tyres || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-red-700 text-[0.55rem] uppercase font-semibold ${archivoBlack.className}`}>
                                            Cafe Hours
                                        </div>
                                        <div className={`text-gray-900 text-[0.7rem] font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.cafe || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-red-700 text-[0.55rem] uppercase font-semibold ${archivoBlack.className}`}>
                                            {event?.openingHours?.officeBranding}Office Hours
                                        </div>
                                        <div className={`text-gray-900 text-[0.7rem] font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.office || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-red-700 text-[0.55rem] uppercase font-semibold ${archivoBlack.className}`}>
                                            {event?.openingHours?.tyreBranding || "-"} Shop Hours
                                        </div>
                                        <div className={`text-gray-900 text-[0.7rem] font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.fuelShop || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sponsors section can be added here if available in API */}
                </div>
            </div>
        </>
    );
}