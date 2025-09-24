// "use client";

// import axios from "axios";
import React from "react";
import { useTicketAndDisplayData } from "@/hooks/useFetch";

import SectionHeader from "@/components/Common/SectionHeader";
import WhiteContainer from "@/components/Common/WhiteContainer";
import Background from "@/components/Common/Background";
import EventTitle from "@/components/Common/EventTitle";


import mapsImage from "@/images/WMR Aerial Map v4 2024-01.jpg";
import AlertMessages from "@/components/Common/Alert";
import { archivoBlack, spaceGrotesk } from '@/fonts/fonts'
import Loader from "@/components/Common/Loader";

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

                        <div className="flex flex-col gap-4 mb-6">
                            <SectionHeader param="Bookings" />
                            <WhiteContainer>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-600 text-white">
                                            <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                Booking
                                            </th>
                                            <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                From
                                            </th>
                                            <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                To
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticketDetails.bookings.map((bookingItem, index) => (
                                            <tr key={index} className="even:bg-gray-50">
                                                <td className="px-1 border-b border-b-gray-500 text-black textSizeCommon">
                                                    {bookingItem.booking}
                                                </td>
                                                <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>
                                                    {new Date(bookingItem.from).toLocaleDateString("en-AU", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric"
                                                    })}
                                                </td>
                                                <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>
                                                    {new Date(bookingItem.to).toLocaleDateString("en-AU", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric"
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </WhiteContainer>
                        </div>
                    </div>
                </Background>
            </div>
        </>
    );
}