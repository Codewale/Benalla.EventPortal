import axios from "axios";
import React from "react";

import ChatModal from "./modal";

// Helper to fetch ticket by id from the API
async function getTicket(id: string) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  // Use relative path since API and UI are on the same origin in Next.js
  return await axios.get(`${baseUrl}/api/tickets/${id}`);
}



export default async function TicketPage({ params }) {
  let ticketDetails;
  try {
    ticketDetails = await getTicket(params.id);
  } catch (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading ticket.
      </div>
    );
  }

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-12">
      <div className="bg-white shadow-2xl rounded-2xl max-w-2xl w-full p-10 md:p-12 lg:p-14 m-4">
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
      
        {/* Sponsors section can be added here if available in API */}
        
      </div>
       <ChatModal params={params}/>
    </div>
  );
}
