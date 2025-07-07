import axios from "axios";
import React from "react";
import mapsImage from "../app/images/WMR Aerial Map v4 2024-01.jpg";

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

export default async function Maps({ params }) {
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
            {/* {alertMessageList &&  
            <ul className="flex justify-center items-center bg-gray-100">
              <div className="space-y-3 w-full max-w-sm">
                {alertMessageList.map(item => (
                  <li
                    key={item.id}
                    style={{
                      backgroundColor: `#${item.alertColour}` || '#FEE2E2'
                    }}
                    className={"rounded-lg shadow-md p-4 text-white flex justify-center items-center gap-2"}
                    role="alert"
                  >
                    {item.alertImage && (
                      <img src={item.alertImage} alt="alert icon" className="w-6 h-6" />
                    )}
                    <p className="text-lg font-medium">{item.alertText}</p>
                  </li>
                ))}
              </div>
            </ul>
          } */}

            {/* have to check if there is any alert then need to show the table where table item will be alert image and alert message */}









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
                    className="flex justify-between items-start flex-1 w-full min-h-0 pb-10"
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
                                    {event?.name || null}
                                </h1>
                                <h1 className="text-base font-bold text-black">
                                    {event?.secondLine || null}
                                </h1>
                                <h1 className="text-base font-bold text-black">
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

                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex justify-center items-center w-full mb-2">
                                <div className="bg-[#E53935] rounded-[0.6rem] w-full py-[0.4rem] flex justify-center items-center">
                                    <span className="text-white text-xs font-bold uppercase tracking-wider">
                                        Maps
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-6 items-center w-full">
                                <div className="w-full flex flex-col gap-2 justify-center items-center">
                                    <div className="bg-white rounded-xl shadow-md flex-1 flex justify-center items-center w-full min-h-[200px]">
                                        {locationMap ? (
                                            <img
                                                src={locationMap}
                                                alt="Map of Location"
                                                className="w-full h-auto max-h-[350px] object-contain rounded-lg border border-gray-200 bg-white"
                                                style={{ width: "100%", backgroundColor: "#fff" }}
                                            />
                                        ) : (
                                            <span className="text-gray-500 italic">Map of the location</span>
                                        )}
                                    </div>
                                    <div className="bg-white rounded-xl shadow-md flex-1 flex justify-center items-center w-full min-h-[200px]">
                                        <img
                                            src={mapsImage.src}
                                            alt="Aerial Map"
                                            className="w-full h-auto max-h-[350px] object-contain rounded-lg border border-gray-200 bg-white"
                                            style={{ width: "100%", backgroundColor: "#fff" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <ChatModal params={params} /> */}
            </div>
        </>
    );
}
