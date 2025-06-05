import React from "react";

// Helper to fetch ticket by id from the API
async function getTicket(id: string) {
  // Use relative path since API and UI are on the same origin in Next.js
  const res = await fetch(`/api/tickets`, { cache: "no-store" });
  console.log(res);
  
  if (!res.ok) {
    console.log(await res.json());
    throw new Error(res)
  }
  const tickets = await res.json();
  return tickets.find((t: any) => t.wdrgns_ticketid === id);
}

export default function TicketPage() {
  // Hardcoded ticket and event data for design/demo
  const ticket = {
    _wdrgns_contactid_value: "John Doe",
    wdrgns_remainingscans: 5,
    createdon: "2025-03-03T22:10:37Z",
    modifiedon: "2025-06-04T10:35:30Z",
    wdrgns_ticket: "Test Events Somnath (Lyfe-B2C Langmead)"
  };

  const eventName = ticket.wdrgns_ticket || "Event Name";
  const eventDate = ticket.createdon?.slice(0, 10) || "Event Date";
  const eventImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
  const eventLogo = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";
  const eventLocation = "Winton Raceway";
  const eventLocationAddress = "41 Fox St, Winton VIC 3673, Australia";
  const cafeOpeningHours = "7:00 AM - 5:00 PM";
  const fuelShopOpeningHours = "8:00 AM - 4:00 PM";
  const officeBranding = "Winton Raceway Office";
  const officeOpeningHours = "8:30 AM - 5:30 PM";
  const tyreOpeningHours = "8:00 AM - 4:00 PM";
  const fuelTyreBranding = "BP & Bridgestone";
  const eventPromoterName = "Lyfe-B2C Langmead";
  const promoterLogo = "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg";
  const primarySponsor = {
    name: "Supercheap Auto",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
  };
  const normalSponsors = [
    { name: "Red Bull", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Dart-logo.png" },
    { name: "Castrol", logo: "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" }
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-12">
      <div className="bg-white shadow-2xl rounded-2xl max-w-2xl w-full p-10 md:p-12 lg:p-14 m-4">
        <div className="flex items-center mb-6">
          <img src={eventLogo} alt="Event Logo" className="w-16 h-16 rounded-full mr-4 border" />
          <div>
            <h1 className="text-2xl font-bold">{eventName}</h1>
            <p className="text-gray-500">{eventDate}</p>
          </div>
        </div>
        <img src={eventImage} alt="Event" className="w-full h-48 object-cover rounded-lg mb-6" />
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="font-semibold text-gray-700">Contact</div>
            <div className="text-gray-900">{ticket._wdrgns_contactid_value}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Remaining Scans</div>
            <div className="text-gray-900">{ticket.wdrgns_remainingscans ?? "N/A"}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Valid From</div>
            <div className="text-gray-900">{ticket.createdon?.slice(0, 10)}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Valid To</div>
            <div className="text-gray-900">{ticket.modifiedon?.slice(0, 10)}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Event Location</div>
            <div className="text-gray-900">{eventLocation}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Location Address</div>
            <div className="text-gray-900">{eventLocationAddress}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Cafe Hours</div>
            <div className="text-gray-900">{cafeOpeningHours}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Fuel Shop Hours</div>
            <div className="text-gray-900">{fuelShopOpeningHours}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Office Branding</div>
            <div className="text-gray-900">{officeBranding}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Office Hours</div>
            <div className="text-gray-900">{officeOpeningHours}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Tyre Hours</div>
            <div className="text-gray-900">{tyreOpeningHours}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Fuel/Tyre Branding</div>
            <div className="text-gray-900">{fuelTyreBranding}</div>
          </div>
        </div>
        <div className="mb-6">
          <div className="font-semibold text-gray-700">Event Promoter</div>
          <div className="flex items-center mt-1">
            <img src={promoterLogo} alt="Promoter Logo" className="w-8 h-8 rounded-full mr-2" />
            <span className="text-gray-900">{eventPromoterName}</span>
          </div>
        </div>
        <div className="mb-6">
          <div className="font-semibold text-gray-700">Primary Sponsor</div>
          <div className="flex items-center mt-1">
            <img src={primarySponsor.logo} alt="Primary Sponsor" className="w-8 h-8 rounded-full mr-2" />
            <span className="text-gray-900">{primarySponsor.name}</span>
          </div>
        </div>
        <div>
          <div className="font-semibold text-gray-700">Sponsors</div>
          <div className="flex mt-1 space-x-4">
            {normalSponsors.map((s, i) => (
              <div key={i} className="flex items-center">
                <img src={s.logo} alt={s.name} className="w-8 h-8 rounded-full mr-2" />
                <span className="text-gray-900">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
