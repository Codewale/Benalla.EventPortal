// "use client";

import { useTicketAndDisplayData } from "@/hooks/useFetch";
import { Space_Grotesk, Archivo_Black } from "next/font/google";
// import axios from "axios";
import React from "react";
import AlertMessages from "@/components/Common/Alert";

import SectionHeader from "@/components/Common/SectionHeader";
import WhiteContainer from "@/components/Common/WhiteContainer";
import Background from "@/components/Common/Background";
import EventTitle from "@/components/Common/EventTitle";
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

export default function PromoterNsopnsors({ params }) {


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
    const alertMessageList = ticketDetails.eventAlerts;
    const vehicleData = ticketDetails.vehicle
    const vehicleImage = ticketDetails.vehicleImage
    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = promoter?.logo ? `${promoter.logo}` : "";
    const locationMap = event?.map ? `${event.map}` : "";
    const qr = qrCode ? `${qrCode}` : "";


    return (
        <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
            {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                <AlertMessages alertMessageList={alertMessageList || []} />
            )}

            <Background eventImage={eventImage}>
                <div className="shadow-2xl w-full p-4">
                    <div className="md:px-12 md:pt-12 pb-0">
                        <EventTitle params={params} />
                    </div>

                    {/* Vehicle Section */}
                    {vehicleData && (
                        <>
                            <SectionHeader param="VEHICLE DETAILS" />
                            <WhiteContainer>
                                <div className="flex flex-col w-[90%]">
                                    <div className="flex justify-between items-center border-b border-t border-gray-500 p-2">
                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                            <span className="text-red-600">Vehicle: </span>{vehicleData.vehicle || "-"}
                                        </span>
                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                            <span className="text-red-600">VIN: </span>{vehicleData.vin || "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-t border-gray-500 p-2">
                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                            <span className="text-red-600">Chassis No: </span>{vehicleData.chassis || "-"}
                                        </span>
                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                            <span className="text-red-600">Registration: </span>{vehicleData.registration || "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-t border-gray-500 p-2">
                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                            <span className="text-red-600">Race No: </span>{vehicleData.race || "-"}
                                        </span>
                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                            <span className="text-red-600">Vehicle Type: </span>{vehicleData.type || "-"}
                                        </span>
                                    </div>
                                </div>
                            </WhiteContainer>
                            <SectionHeader param="Vehicle Image" />
                            <WhiteContainer>
                                {vehicleImage ? (
                                    <img
                                        src={vehicleImage}
                                        alt="Event Map"
                                        className="w-full h-auto object-contain"
                                    />
                                ) : (
                                    <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
                                        Vehicle image not available
                                    </span>
                                )}
                            </WhiteContainer>
                        </>
                    )}
                </div>
            </Background>
        </div>
    );
}
