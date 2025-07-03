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
            {/* {eventImage && (
              <img
                src={eventImage}
                alt="Event"
                className="w-full h-48 object-contain rounded-lg mb-6"
              />
            )} */}

            {qr && (
              <div className="flex justify-center items-center m-4">
                <img src={qr}
                  alt="QR CODE"
                  className="w-[250px] h-[250px] object-cover rounded-3xl mb-6"
                />
              </div>
            )}


            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">CONTACT</div>
                <div className="text-white font-bold text-sm">{contact?.fullname || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">REMAINING SCANS</div>
                <div className="text-white font-bold text-sm">
                  {ticket?.remainingScans ?? "N/A"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">VALID FROM</div>
                <div className="text-white font-bold text-sm">
                  {ticketType?.validFrom?.slice(0, 10) || "-"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">VALID TO</div>
                <div className="text-white font-bold text-sm">
                  {ticketType?.validTo?.slice(0, 10) || "-"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">LOCATION</div>
                <div className="text-white font-bold text-sm">{location?.name || "-"}</div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">DESCRIPTION</div>
                <div className="text-white font-bold text-sm">{event?.description || "-"}</div>
              </div>
              {/* <div>
                <div className="font-semibold text-gray-700">Location Address</div>
                <div className="text-gray-900">
                  {location?.addressLine1 || "-"}
                  {location?.addressLine2 ? `, ${location.addressLine2}` : ""}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Location Map</div>


                <div className="text-gray-900">
                  {
                    locationMap ?
                      <img
                        src={locationMap}
                        alt="Map of Location"
                        className="w-20 h-16 object-cover rounded-lg mb-6"
                      />
                      :
                      <p className="text-gray-900">Map of the location </p>
                  }
                </div>



              </div>
              <div>
                <div className="font-semibold text-gray-700">Cafe Hours</div>
                <div className="text-gray-900">
                  {event?.openingHours?.cafe || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Fuel Shop Hours</div>
                <div className="text-gray-900">
                  {event?.openingHours?.fuelShop || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Office Branding</div>
                <div className="text-gray-900">
                  {event?.openingHours?.officeBranding || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Office Hours</div>
                <div className="text-gray-900">
                  {event?.openingHours?.office || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Tyre Hours</div>
                <div className="text-gray-900">
                  {event?.openingHours?.tyres || "-"}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">
                  Fuel/Tyre Branding
                </div>
                <div className="text-gray-900">
                  {event?.openingHours?.tyreBranding || "-"}
                </div>
              </div> */}
            </div>
            {/* <div className="mb-6">
              <div className="font-semibold text-gray-700">Event Promoter</div>
              <div className="flex items-center mt-1">
                <img
                  src={promoterLogo}
                  alt="Promoter Logo"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-gray-900">{promoter?.name || "-"}</span>
              </div>
            </div> */}

            {/* Wrap tables in a scrollable container to prevent overflow */}
            {/* <div className="overflow-x-auto">

              <table className="min-w-full mt-5 divide-y divide-gray-200">
                <caption className="text-gray-900 font-medium">Table of event Schedule</caption>
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventSchedules.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.eventNumber ? `${item.eventNumber}` : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeFromISOString(item.startTime, { timeZone: "UTC" })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeFromISOString(item.endTime, { timeZone: "UTC" })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.session ? `${item.session}` : "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time ? `${item.time}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="mt-10 w-full divide-y divide-gray-200 table-auto">
                <caption className="text-gray-900 font-medium">Table of Ticket Link</caption>
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Url
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link Image
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ticketLinks.map((item) => (
                    <tr key={item.displayOrder}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a href={`${item.url}`} target="_blank" className="text-blue-500 underline">

                          {item.url}
                        </a>
                      </td>
                      {item.linkImage ?
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.linkImage}</td>
                        :
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>

                      }
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="mt-10 w-full divide-y divide-gray-200 table-auto">
                <caption className="text-gray-900 font-medium">Table of Sponsors</caption>
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sponsors.map((item) => (
                    <tr key={item.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      {item.image ?
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <img
                            src={item.image}
                            alt="Map of Location"
                            className="w-8 h-8 object-cover rounded-lg"
                          />
                        </td>
                        :
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                      }
                    </tr>
                  ))}
                </tbody>
              </table>

              {primarySponsors.length > 0 &&

                <table className="mt-10 w-full divide-y divide-gray-200 table-auto">
                  <caption className="text-gray-900 font-medium">Table of Primary Sponsor</caption>
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {primarySponsors.map((item) => (
                      <tr key={item.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        {item.image ?
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <img
                              src={item.image}
                              alt="Image of Primary Sponsors"
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          </td>
                          :
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div> */}

            {/* Sponsors section can be added here if available in API */}
          </div>
          {/* <ChatModal params={params} /> */}
        </div>


      </div>
    </>
  );
}
