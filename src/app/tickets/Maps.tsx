"use client";

// import axios from "axios";
import React from "react";
import { useTicketAndDisplayData } from "../../hooks/useFetch.js";

import SectionHeader from "../../components/Common/SectionHeader";
import WhiteContainer from "../../components/Common/WhiteContainer";
import Background from "../../components/Common/Background";
import EventTitle from "../../components/Common/EventTitle";


import mapsImage from "../../app/images/WMR Aerial Map v4 2024-01.jpg";
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

            <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />
                )}

                <Background eventImage={eventImage}>

                    <div className="shadow-2xl w-full p-4 md:p-12 lg:p-14">
                        <EventTitle params={params} />

                        <div className="flex flex-col gap-4 mb-6">
                            <SectionHeader param="Maps" />
                            <div className="flex flex-col gap-6 items-center w-full">
                                <div className="w-full flex flex-col gap-2 justify-center items-center">
                                    <WhiteContainer>
                                        {locationMap ? (
                                            <img
                                                src={locationMap}
                                                alt="Map of Location"
                                                className="w-full h-auto object-contain  rounded-lg border bg-white"
                                                style={{ width: "100%", backgroundColor: "#fff" }}
                                            />
                                        ) : (
                                            <span className="text-gray-500 italic">
                                                Map of the location
                                            </span>
                                        )}
                                    </WhiteContainer>


                                    <WhiteContainer>
                                        <img
                                            src={mapsImage.src}
                                            alt="Aerial Map"
                                            className="w-full h-auto object-contain rounded-lg border bg-white"
                                            style={{ width: "100%", backgroundColor: "#fff" }}
                                        />
                                    </WhiteContainer>


                                </div>
                            </div>
                        </div>
                    </div>
                </Background>
            </div>
        </>
    );
}