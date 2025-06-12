import axios from "axios";
import React from "react";

import ChatModal from "./modal";

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
    alertMessageList = displayOrderDetails.data?.eventAlerts;
    ticketLinks = displayOrderDetails.data?.ticketLinks;

    console.log(ticketLinks);
  } catch (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading ticket.
      </div>
    );
  }


  const sortedDisplayOrder = displayOrderDetails.data?.eventSchedules.sort((a, b) => a.displayOrder - b.displayOrder);


  // Map API response fields

  const ticket = ticketDetails.data.ticket;
  const ticketType = ticketDetails.data.ticketType;
  const contact = ticketDetails.data.contact;
  const event = ticketDetails.data.event;
  const promoter = ticketDetails.data.promoter;
  const location = ticketDetails.data.location;

  const eventImage = event?.image ? `data:image/png;base64,${event.image}` : "";
  const eventLogo = event?.logo ? `data:image/png;base64,${event.logo}` : "";
  const promoterLogo = promoter?.logo
    ? `data:image/png;base64,${promoter.logo}`
    : "";

  return (
    <>
          {alertMessageList &&  
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
          }




      <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-12">
        
        <div className="bg-white shadow-2xl rounded-2xl max-w-[800px] w-full p-10 md:p-12 lg:p-14 m-4">
          <div className="flex items-center mb-6">
            {eventImage && (
              <img
                src={eventLogo}
                alt="Event Logo"
                className="w-16 h-16 rounded-full mr-4 border"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {event?.name || ticket?.name}
              </h1>
              <p className="text-gray-500">
                {event?.startDate?.slice(0, 10) ||
                  ticketType?.validFrom?.slice(0, 10)}
              </p>
            </div>
          </div>
          {eventImage && (
            <img
              src={eventImage}
              alt="Event"
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
          )}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="font-semibold text-gray-700">Contact</div>
              <div className="text-gray-900">{contact?.fullname || "-"}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Remaining Scans</div>
              <div className="text-gray-900">
                {ticket?.remainingScans ?? "N/A"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Valid From</div>
              <div className="text-gray-900">
                {ticketType?.validFrom?.slice(0, 10) || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Valid To</div>
              <div className="text-gray-900">
                {ticketType?.validTo?.slice(0, 10) || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Event Location</div>
              <div className="text-gray-900">{location?.name || "-"}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Location Address</div>
              <div className="text-gray-900">
                {location?.addressLine1 || "-"}
                {location?.addressLine2 ? `, ${location.addressLine2}` : ""}
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
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold text-gray-700">Event Promoter</div>
            <div className="flex items-center mt-1">
              <img
                src={promoterLogo}
                alt="Promoter Logo"
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="text-gray-900">{promoter?.name || "-"}</span>
            </div>
          </div>

          {/* Wrap tables in a scrollable container to prevent overflow */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
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
                    Event Number
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
                {sortedDisplayOrder.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeFromISOString(item.startTime, { timeZone: "UTC" })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeFromISOString(item.endTime, { timeZone: "UTC" })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.eventNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.session}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>    

            <table className="mt-10 w-full divide-y divide-gray-200 table-auto">
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
          </div>

          {/* Sponsors section can be added here if available in API */}
        </div>
        <ChatModal params={params}/>
      </div>
    </>
  );
}
