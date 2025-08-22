"use client";
import { useTicketAndDisplayData } from "@/hooks/useFetch";
import AlertMessages from "@/components/common/Alert";
import React from "react";
import SectionHeader from "@/components/common/SectionHeader";
import WhiteContainer from "@/components/common/WhiteContainer";
import Background from "@/components/common/Background";
import EventTitle from "@/components/common/EventTitle";
import Loader from "@/components/common/Loader";
import { archivoBlack, spaceGrotesk } from '@/fonts/fonts'
import formatTimeFromISOString from '@/hooks/formatTimeFromISOString'

export default function Schedules({ params }) {

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

    const groupedByDay = eventSchedules.reduce((acc, item) => {
        const day = new Date(item.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            timeZone: "UTC", // Adjust if needed
        });

        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {});

    // console.log(eventImage);
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


                        {/* Wrap tables in a scrollable container to prevent overflow */}
                        <div className="w-full flex flex-col items-center">
                            {Object.entries(groupedByDay).map(([day, items]) => (
                                <>
                                    <SectionHeader
                                        param={`EVENT SCHEDULE - ${day.toUpperCase()} (${items?.length > 0
                                            ? new Date(items[0].startTime).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : ""
                                            })`}
                                    />
                                    {/* <div
key={day}
className="w-full max-w-2xl bg-white rounded-2xl shadow-lg mb-8 border-2 border-gray-200 p-4"
> */}
                                    <WhiteContainer key={day}>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-gray-600 text-white">
                                                    <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                        Event
                                                    </th>
                                                    <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                        Category
                                                    </th>
                                                    <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                        Start
                                                    </th>
                                                    <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon  ${archivoBlack.className}`}>
                                                        End
                                                    </th>
                                                    <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                        Session
                                                    </th>
                                                    <th className={`px-1 font-semibold border-b border-gray-200 text-left textSizeCommon ${archivoBlack.className}`}>
                                                        Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id} className="even:bg-gray-50">
                                                        <td className="px-1 border-b border-b-gray-500 text-black textSizeCommon">
                                                            {item.eventNumber}
                                                            <span
                                                                className="inline-block w-3 h-3 rounded-full align-middle ml-2"
                                                                style={{ backgroundColor: item.displayColour || "rgba(0,0,0,0)" }}
                                                            ></span>
                                                        </td>
                                                        <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>{item.item}</td>
                                                        <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>{formatTimeFromISOString(item.startTime, { timeZone: "UTC" })}</td>
                                                        <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>{formatTimeFromISOString(item.endTime, { timeZone: "UTC" })}</td>
                                                        <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>{item.session}</td>
                                                        <td className={`px-1 border-b border-b-gray-500 text-black font-semibold textSizeCommon ${spaceGrotesk.className}`}>{item.time}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </WhiteContainer>

                                    {/* </div> */}
                                </>

                            ))}
                        </div>
                    </div>
                </Background>
            </div>
        </>
    );
}