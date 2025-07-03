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

    console.log(alertMessageList);
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
                    className="flex flex-col md:flex-row justify-between items-start w-full min-h-0"
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

                    {/* Ticket Links Table */}
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
                        <div className="bg-white rounded-xl shadow-lg w-full md:w-1/2 p-6 mb-8 md:mb-0 md:mr-8">
                            <table className="w-full divide-y divide-gray-200 table-auto">
                                <caption className="text-gray-900 font-medium mb-2">Table of Ticket Link</caption>
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Url
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Link Image
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ticketLinks.map((item: { displayOrder: number; name: string; url: string; linkImage?: string }) => (
                                        <tr key={item.displayOrder}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600 underline">
                                                <a href={`${item.url}`} target="_blank" rel="noopener noreferrer">
                                                    {item.url}
                                                </a>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {item.linkImage ? item.linkImage : item.name}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Opening Hours Card */}
                        <div className="bg-white rounded-xl shadow-lg w-full md:w-1/2 p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-bold text-red-700 text-xs uppercase">Cafe Hours</div>
                                    <div className="text-gray-900 text-sm">{event?.openingHours?.cafe || "-"}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-red-700 text-xs uppercase">Fuel Shop Hours</div>
                                    <div className="text-gray-900 text-sm">{event?.openingHours?.fuelShop || "-"}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-red-700 text-xs uppercase">Office Branding</div>
                                    <div className="text-gray-900 text-sm">{event?.openingHours?.officeBranding || "-"}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-red-700 text-xs uppercase">Office Hours</div>
                                    <div className="text-gray-900 text-sm">{event?.openingHours?.office || "-"}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-red-700 text-xs uppercase">Tyre Hours</div>
                                    <div className="text-gray-900 text-sm">{event?.openingHours?.tyres || "-"}</div>
                                </div>
                                <div>
                                    <div className="font-bold text-red-700 text-xs uppercase">Fuel/Tyre Branding</div>
                                    <div className="text-gray-900 text-sm">{event?.openingHours?.tyreBranding || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sponsors section can be added here if available in API */}
                </div >
                {/* <ChatModal params={params} /> */}
            </div>
        </>
    );
}
