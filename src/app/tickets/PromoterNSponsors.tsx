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

                    <div className="shadow-2xl w-full p-4">
                        <div className="md:px-12 md:pt-12 pb-0" >
                            <EventTitle params={params} />
                        </div>

                        <div className="flex flex-col w-full mt-8">
                            {/* Event Promoters */}
                            <>
                                {/* <div className={`text-[0.65rem] font-bold text-red-600 tracking-wide ${archivoBlack.className}`}>
                                    EVENT PROMOTERS
                                </div> */}
                                <SectionHeader param="EVENT PROMOTERS" />
                                <WhiteContainer>
                                    <div className="flex flex-col w-[90%]">
                                        <div className="flex justify-between items-center border-b border-t border-gray-500 p-2">
                                            <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
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
                                </WhiteContainer>

                            </>


                            {/* Key Sponsors */}
                            {primarySponsors?.length > 0 && (
                                <>
                                    <SectionHeader param="KEY SPONSORS" />
                                    <WhiteContainer>
                                        <div className="flex flex-col w-[90%]">
                                            {primarySponsors.map(
                                                (item: { name: string; image?: string }) => (
                                                    <div
                                                        key={item.name}
                                                        className="flex justify-between items-center border-b border-t border-gray-500 py-2"
                                                    >
                                                        <span className={`font-semibold text-gray-800 textSizeCommon ${spaceGrotesk.className}`}>
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
                                    </WhiteContainer>

                                </>

                            )}

                            {/* Sponsors */}
                            {sponsors?.length > 0 && (
                                <>
                                    <SectionHeader param="SPONSORS" />
                                    <WhiteContainer>
                                        <div className="flex flex-col w-[90%]">
                                            {sponsors.map((item: { name: string; image?: string }) => (
                                                <div
                                                    key={item.name}
                                                    className="flex justify-between textSizeCommon items-center border-b border-t border-gray-500 py-2"
                                                >
                                                    <span className={`font-semibold text-gray-800 ${spaceGrotesk.className}`}>
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
                                    </WhiteContainer>
                                </>

                            )}
                        </div>
                    </div>
                </Background>
            </div>
        </>
    );
}