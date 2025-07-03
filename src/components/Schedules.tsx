import axios from "axios";
import React from "react";


// Helper to fetch ticket by id from the API
async function getTicket(id: string) {
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    // Use relative path since API and UI are on the same origin in Next.js
    return await axios.get(`${baseUrl}/api/tickets/${id}`);
}


// Helper to fetch display order for table from API 
async function getDisplayOrder(id: string) {
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    // Use relative path since API and UI are on the same origin in Next.js
    return await axios.get(`${baseUrl}/api/display/${id}`);
}


// function which transfrom the time of table and object is used for timezone

function formatTimeFromISOString(isoString, options = {}) {
    const date = new Date(isoString);

    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        ...options,
    });
}

export default async function TicketPage({ params }) {
    let ticketDetails;
    let displayOrderDetails;
    let alertMessageList;
    let ticketLinks;
    try {
        ticketDetails = await getTicket(params.id);
        displayOrderDetails = await getDisplayOrder(params.id);
        alertMessageList = ticketDetails.data?.eventAlerts;
        ticketLinks = displayOrderDetails.data?.ticketLinks;



    } catch (error) {
        return (
            <div className="text-center mt-10 text-red-500">
                Error loading ticket.
            </div>
        );
    }







    // const sortedDisplayOrder = displayOrderDetails.data?.eventSchedules.sort((a, b) => a.displayOrder - b.displayOrder);


    // Map API response fields

    const ticket = ticketDetails.data.ticket;
    const ticketType = ticketDetails.data.ticketType;
    const contact = ticketDetails.data.contact;
    const event = ticketDetails.data.event;
    const promoter = ticketDetails.data.promoter;
    const location = ticketDetails.data.location;
    const sponsors = ticketDetails.data.sponsors;
    const primarySponsors = ticketDetails.data.primarySponsors;
    const qrCode = ticketDetails.data.qrCode;
    const eventSchedules = ticketDetails.data.eventSchedules;





    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = promoter?.logo
        ? `${promoter.logo}`
        : "";
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
                    <div className="flex flex-col left-0 w-full z-50 gap-1">
                        {alertMessageList.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 px-4 py-1"
                                style={{
                                    backgroundColor: item.alertColour || '#fef3c7', // fallback to light yellow
                                }}
                            >
                                {item.alertImageBase64 ? (
                                    <img
                                        src={`${item.alertImageBase64}`}
                                        alt="Alert"
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                                        !
                                    </div>
                                )}

                                <p className="text-[0.6rem] font-bold text-white italic">{item.alertText || 'No alert message provided.'}</p>
                            </div>
                        ))}
                    </div>
                )}


                <div
                    className="flex justify-between items-start flex-1 w-full min-h-0"
                    style={{
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
                                <img
                                    src={eventLogo}
                                    alt="Event Logo"
                                    className="w-16 h-16"
                                />
                            )}
                            <div className="flex-1 text-center">
                                <h1 className="text-base font-bold text-black">
                                    {event?.name || ticket?.name}
                                </h1>
                                <p className="text-base font-bold text-black">
                                    {(() => {
                                        // Try event.startDate first, then ticketType.validFrom
                                        const dateStr = event?.startDate || ticketType?.validFrom;
                                        if (!dateStr) return "-";
                                        const date = new Date(dateStr);
                                        if (event?.endDate) {
                                            const endDate = new Date(event.endDate);
                                            if (
                                                date.getMonth() === endDate.getMonth() &&
                                                date.getFullYear() === endDate.getFullYear()
                                            ) {
                                                return `${date.getDate()}-${endDate.getDate()} ${date.toLocaleString("en-GB", {
                                                    month: "long",
                                                })} ${date.getFullYear()}`;
                                            }
                                        }
                                        return `${date.getDate()} ${date.toLocaleString("en-GB", {
                                            month: "long",
                                        })} ${date.getFullYear()}`;
                                    })()}
                                </p>
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
                                <div key={day} className="w-full max-w-2xl bg-white rounded-2xl shadow-lg mb-8 border-2 border-gray-200 p-4">
                                    <div className="bg-red-700 text-white text-center font-semibold text-xs tracking-wide p-[0.18rem]">
                                        EVENT SCHEDULE - {day.toUpperCase()}
                                        {" "}
                                        (
                                        {items.length > 0
                                            ? new Date(items[0].startTime).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : ""}
                                        )
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-gray-600 text-white">
                                                <th className="px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem]">Event Category</th>
                                                <th className="px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem]">Start</th>
                                                <th className="px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem]">End</th>
                                                <th className="px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem]">Session</th>
                                                <th className="px-1 font-semibold border-b border-gray-200 text-left text-[0.55rem]">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr key={item.id} className="even:bg-gray-50">
                                                    <td className="py-1 px-2 border-b border-gray-100 text-black text-[0.55rem]">{item.item}</td>
                                                    <td className="py-1 px-2 border-b border-gray-100 text-black text-[0.55rem]">{formatTimeFromISOString(item.startTime, { timeZone: "UTC" })}</td>
                                                    <td className="py-1 px-2 border-b border-gray-100 text-black text-[0.55rem]">{formatTimeFromISOString(item.endTime, { timeZone: "UTC" })}</td>
                                                    <td className="py-1 px-2 border-b border-gray-100 text-black text-[0.55rem]">{item.session}</td>
                                                    <td className="py-1 px-2 border-b border-gray-100 text-black text-[0.55rem]">{item.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                        {/* Sponsors section can be added here if available in API */}
                    </div>
                    {/* <ChatModal params={params} /> */}
                </div>


            </div>
        </>
    );
}
