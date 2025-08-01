"use client";
import { useTicketAndDisplayData } from "@/hooks/useFetch";
import AlertMessages from "@/UI/Alert";
import React from "react";
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

export default function Schedules({ params }) {

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

    const groupedByDay = eventSchedules.reduce((acc, item) => {
        const day = new Date(item.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            timeZone: "UTC", // Adjust if needed
        });

        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {});

    console.log(eventSchedules);
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

                        {/* Wrap tables in a scrollable container to prevent overflow */}
                        <div className="w-full flex flex-col items-center">
                            {Object.entries(groupedByDay).map(([day, items]) => (
                                <div
                                    key={day}
                                    className="w-full max-w-2xl bg-white rounded-2xl shadow-lg mb-8 border-2 border-gray-200 p-4"
                                >
                                    <div className={`bg-red-700 text-white text-center font-semibold text-[0.65rem] tracking-wide p-[0.18rem] ${archivoBlack.className}`}>
                                        EVENT SCHEDULE - {day.toUpperCase()} (
                                        {items?.length > 0
                                            ? new Date(items[0].startTime).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                }
                                            )
                                            : ""}
                                        )
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-gray-600 text-white">
                                                <th className={`px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem] ${spaceGrotesk.className}`}>
                                                    Event
                                                </th>
                                                <th className={`px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem] ${spaceGrotesk.className}`}>
                                                    Category
                                                </th>
                                                <th className={`px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem] ${spaceGrotesk.className}`}>
                                                    Start
                                                </th>
                                                <th className={`px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem] ${spaceGrotesk.className}`}>
                                                    End
                                                </th>
                                                <th className={`px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem] ${spaceGrotesk.className}`}>
                                                    Session
                                                </th>
                                                <th className={`px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem] ${spaceGrotesk.className}`}>
                                                    Time
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr key={item.id} className="even:bg-gray-50">
                                                    <td className="px-1 border-b border-b-gray-500 text-black text-[0.55rem]">
                                                        {item.eventNumber}
                                                        <span
                                                            className="inline-block w-3 h-3 rounded-full align-middle ml-2"
                                                            style={{ backgroundColor: item.displayColour || "rgba(0,0,0,0)" }}
                                                        ></span>
                                                    </td>
                                                    <td className="px-1 border-b border-b-gray-500 text-black text-[0.55rem]">{item.item}</td>
                                                    <td className="px-1 border-b border-b-gray-500 text-black text-[0.55rem]">{formatTimeFromISOString(item.startTime, { timeZone: "UTC" })}</td>
                                                    <td className="px-1 border-b border-b-gray-500 text-black text-[0.55rem]">{formatTimeFromISOString(item.endTime, { timeZone: "UTC" })}</td>
                                                    <td className="px-1 border-b border-b-gray-500 text-black text-[0.55rem]">{item.session}</td>
                                                    <td className="px-1 border-b border-b-gray-500 text-black text-[0.55rem]">{item.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}