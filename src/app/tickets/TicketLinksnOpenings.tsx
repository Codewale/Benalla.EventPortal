// "use client";

import axios from "axios";
import React from "react";
import Background from "@/components/Common/Background";
import WhiteContainer from "@/components/Common/WhiteContainer";
import EventTitle from "@/components/Common/EventTitle";
import { useTicketAndDisplayData } from "@/hooks/useFetch";
import AlertMessages from "@/components/Common/Alert";
import { Space_Grotesk, Archivo_Black } from "next/font/google";
import Loader from "@/components/Common/Loader";
import { archivoBlack, spaceGrotesk } from '@/fonts/fonts'

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
        return <Loader />;
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

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />


                )}

                <Background eventImage={eventImage}>

                    <div className="shadow-2xl w-full p-4">
                        <div className="md:px-12 md:pt-12 pb-0" >
                            <EventTitle params={params} />
                        </div>

                        <div className="flex flex-col items-center justify-start w-full gap-2">
                            {getLinksByType("Information").length > 0 && (
                                <WhiteContainer>
                                    <table className="w-full">
                                        <tbody>
                                            {getLinksByType("Information").map((item) => (
                                                <React.Fragment key={item.displayOrder}>
                                                    {/* Heading row */}
                                                    <tr>
                                                        <td colSpan={2} className="py-0.5 text-center">
                                                            <span className={`font-bold textSizeCommon uppercase text-red-700 ${archivoBlack.className}`}>
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Image and link row */}
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-1 pr-2 align-top w-12">
                                                            {item.linkImageBase64 ? (
                                                                <img
                                                                    src={item.linkImageBase64}
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
                                                                className="textSizeCommon text-black font-semibold break-all no-underline"
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
                                </WhiteContainer>
                                // <div className="bg-white rounded-xl shadow-lg w-full p-3 mb-4 ">

                                // </div>
                            )}

                            {/* Section for "Document" ticket links */}
                            {getLinksByType("Document").length > 0 && (
                                // <div className="bg-white rounded-xl shadow-lg w-full p-3 mb-4 ">
                                <WhiteContainer>
                                    <table className="w-full">
                                        <tbody>
                                            {getLinksByType("Document").map((item) => (
                                                <React.Fragment key={item.displayOrder}>
                                                    {/* Heading row */}
                                                    <tr>
                                                        <td colSpan={2} className="py-0.5 text-center">
                                                            <span className={`font-bold textSizeCommon uppercase text-red-700 ${archivoBlack.className}`}>
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Image and link row */}
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-1 pr-2 align-top w-12">
                                                            {item.linkImageBase64 ? (
                                                                <img
                                                                    src={item.linkImageBase64}
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
                                                                className="textSizeCommon text-black font-semibold break-all no-underline"
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
                                </WhiteContainer>
                                // </div>
                            )}

                            {/* Section for "Advertisement" ticket links */}
                            {getLinksByType("Advertising").length > 0 && (
                                // <div className="bg-white rounded-xl shadow-lg w-full p-3 mb-4 ">
                                <WhiteContainer>
                                    <table className="w-full">
                                        <tbody>
                                            {getLinksByType("Advertising").map((item) => (
                                                <React.Fragment key={item.displayOrder}>
                                                    {/* Heading row */}
                                                    <tr>
                                                        <td colSpan={2} className="py-0.5 text-center">
                                                            <span className={`font-bold textSizeCommon uppercase text-red-700 ${archivoBlack.className}`}>
                                                                {item.name}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Image and link row */}
                                                    <tr className="border-b border-gray-200">
                                                        <td className="py-1 pr-2 align-top w-12">
                                                            {item.linkImageBase64 ? (
                                                                <img
                                                                    src={item.linkImageBase64}
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
                                                                className="textSizeCommon text-black font-semibold break-all no-underline"
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
                                </WhiteContainer>
                                // </div>
                            )}
                            {/* Opening Hours Card */}
                            {/* <div className="bg-white rounded-xl shadow-lg w-full p-6"> */}
                            <WhiteContainer>
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div>
                                        <div className={`text-red-700 textSizeCommon uppercase font-semibold ${archivoBlack.className}`}>
                                            {event?.openingHours?.tyreBranding} Tyre Hours
                                        </div>
                                        <div className={`text-gray-900 textSizeCommon font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.tyres || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-red-700 textSizeCommon uppercase font-semibold ${archivoBlack.className}`}>
                                            Cafe Hours
                                        </div>
                                        <div className={`text-gray-900 textSizeCommon font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.cafe || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-red-700 textSizeCommon uppercase font-semibold ${archivoBlack.className}`}>
                                            {event?.openingHours?.officeBranding}Office Hours
                                        </div>
                                        <div className={`text-gray-900 textSizeCommon font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.office || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-red-700 textSizeCommon uppercase font-semibold ${archivoBlack.className}`}>
                                            Fuel Shop Hours
                                        </div>
                                        <div className={`text-gray-900 textSizeCommon font-bold ${spaceGrotesk.className}`}>
                                            {event?.openingHours?.fuelShop || "-"}
                                        </div>
                                    </div>
                                </div>
                            </WhiteContainer>
                            {/* </div> */}
                        </div>

                    </div>
                </Background>
            </div>
        </>
    );
}