import axios from "axios";
import React from "react";


// Helper to fetch events from API
async function getEventsWithText(id: string) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  return await axios.get(`${baseUrl}/api/events/${id}`);
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
  let eventWithText;
  let displayOrderDetails;


  try {
    eventWithText = await getEventsWithText(params.id);
     displayOrderDetails = await getDisplayOrder(params.id);

    
    console.log(eventWithText.data);

  } catch (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading ticket.
      </div>
    );
  }
  
  const sortedDisplayOrder = displayOrderDetails.data?.eventSchedules.sort((a, b) => a.displayOrder - b.displayOrder);


  // Map API response fields

  const ticket = eventWithText.data.ticket;
  const ticketType = eventWithText.data.ticketType;
  const contact = eventWithText.data.contact;
  const event = eventWithText.data.event;
  const promoter = eventWithText.data.promoter;
  const location = eventWithText.data.location;
  const sponsors = eventWithText.data.sponsors;
  const primarySponsors = eventWithText.data.primarySponsors;

  console.log(contact);

  const eventImage = event?.image ? `data:image/png;base64,${event.image}` : "";
  const eventLogo = event?.logo ? `data:image/png;base64,${event.logo}` : "";
  const promoterLogo = promoter?.logo
    ? `data:image/png;base64,${promoter.logo}`
    : "";

  return (
    <>
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
              <div className="font-semibold text-gray-700">Event Name</div>
              <div className="text-gray-900">{event?.name || "-"}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Event Date</div>
              <div className="text-gray-900">
                {event?.startDate?.slice(0, 10) || "-"}
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700">Event Image</div>
                <div className="flex items-center mt-1">
                <img
                  src={eventImage}
                  alt="Event Image"
                  className="w-8 h-8 rounded-full mr-2"
                />
                </div>
            </div>


            <div>
              <div className="font-semibold text-gray-700">Event Logo</div>
              <div className="flex items-center mt-1">
              <img
                src={eventLogo}
                alt="Event Logo"
                className="w-8 h-8 rounded-full mr-2"
              />
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Description</div>
              <div className="text-gray-900">
                {event?.descriptionBlurb || "This is Description"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Location Name</div>
              <div className="text-gray-900">
                {location?.name || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Location Address</div>
              <div className="text-gray-900">
                
                {(location?.addressLine1 || "-") || (location?.addressLine2 || "-") }

              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Cafe Opening Hours</div>
              <div className="text-gray-900">
                {event?.openingHours?.cafe || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Fuel Opening Hours</div>
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
              <div className="font-semibold text-gray-700">Office Opening Hours</div>
              <div className="text-gray-900">
                {event?.openingHours?.office || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Tyre Opening Hours</div>
              <div className="text-gray-900">
                {event?.openingHours?.tyres || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Fuel Tyre Branding</div>
              <div className="text-gray-900">
                {event?.openingHours?.tyreBranding || "-"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Promoter</div>
              <div className="text-gray-900">
                {promoter?.name || "-"}
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700">Promoter Logo</div>
              <div className="flex items-center mt-1">
              <img
                src={promoterLogo}
                alt="Promoter Logo"
                className="w-8 h-8 rounded-full mr-2"
              />
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700">On Scale From</div>
              <div className="text-gray-900">
                {/* {event?.onSaleFrom || "-"} */}
                {event?.onSaleFrom?.slice(0, 10) || "-"}
              </div>
            </div>          

          </div>  

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
                    Image 
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sponsors.map((item, index) => (
                  <tr key={`${index + 1}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.image ? <a href={`${item.image}`} target="_blank" className="text-blue-500 underline">
                        {item.image}
                      </a> : <p>No Image Yet</p> }
                    </td>                  
                  </tr>
                ))}
              </tbody>
            </table>

            {(primarySponsors.lenght) > 0  &&
            
            <table className="mt-10 w-full divide-y divide-gray-200 table-auto">
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
                {primarySponsors.map((item, index) => (
                  <tr key={`${index + 1}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.image ? <a href={`${item.image}`} target="_blank" className="text-blue-500 underline">
                        {item.image}
                      </a> : <p>No Image Yet</p> }
                    </td>                  
                  </tr>
                ))}
              </tbody>
            </table>
            
            }


          </div>

          </div>
          {/* Sponsors section can be added here if available in API */}
        </div>
    </>
  );
}
