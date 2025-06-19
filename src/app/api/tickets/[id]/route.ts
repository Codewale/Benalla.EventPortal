import axios from "axios";
import { NextResponse } from "next/server";

async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: `${process.env.RESOURCE}/.default`,
  });

  const res = await axios.post(url, params);
  return res.data.access_token;
}

export async function GET(req, { params }) {
  const ticketId = params.id;
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const ticketRes = await axios.get(`${baseUrl}/wdrgns_tickets(${ticketId})`, {
    headers,
  });
  const ticket = ticketRes.data;

  let contact = null;
  if (ticket._wdrgns_contactid_value) {
    const res = await axios.get(
      `${baseUrl}/contacts(${ticket._wdrgns_contactid_value})?$select=fullname`,
      { headers }
    );
    contact = res.data;
  }

  let ticketType = null;
  if (ticket._wdrgns_tickettype_value) {
    const res = await axios.get(
      `${baseUrl}/wdrgns_tickettypes(${ticket._wdrgns_tickettype_value})?$select=wdrgns_validfrom,wdrgns_validto,wdrgns_enableaskadam`,
      { headers }
    );
    ticketType = res.data;
  }

  const eventRes = await axios.get(
    `${baseUrl}/wdrgns_events?$select=wdrgns_event,wdrgns_eventid,wdrgns_startdate,wdrgns_enddate,_wdrgns_promoterid_value,_wdrgns_locationid_value,wdrgns_openinghourscafe,wdrgns_openinghoursfuelshop,wdrgns_openinghoursoffice,wdrgns_openinghoursofficebranding,wdrgns_openinghourstyres,wdrgns_openinghourstyrebranding,wdrgns_image,wdrgns_logo&$expand=wdrgns_ticket_wdrgns_multievent($filter=wdrgns_ticketid eq ${ticketId})`,
    { headers }
  );
  const events = eventRes.data.value;

  const now = new Date();
  let selectedEvent =
    events.find(
      (e) =>
        new Date(e.wdrgns_startdate) <= now && new Date(e.wdrgns_enddate) >= now
    ) ||
    events.find((e) => new Date(e.wdrgns_startdate) > now) ||
    [...events].reverse().find((e) => new Date(e.wdrgns_enddate) < now);
  let futureEvents = events.filter((e) => new Date(e.wdrgns_startdate) > now);
  futureEvents.sort(
    (a, b) => new Date(a.wdrgns_startdate) - new Date(b.wdrgns_startdate)
  );
  if (futureEvents.length > 0) {
    selectedEvent = futureEvents[0];
  } else {
    let pastEvents = events.filter((e) => new Date(e.wdrgns_startdate) <= now);
    pastEvents.sort(
      (a, b) => new Date(b.wdrgns_startdate) - new Date(a.wdrgns_startdate)
    );
    if (pastEvents.length > 0) {
      selectedEvent = pastEvents[0];
    }
  }
 
  if (!selectedEvent) throw new Error("No related event found.");

  let promoter = null;
  if (selectedEvent._wdrgns_promoterid_value) {
    const res = await axios.get(
      `${baseUrl}/accounts(${selectedEvent._wdrgns_promoterid_value})?$select=name,entityimage`,
      { headers }
    );
    promoter = res.data;
  }

  let location = null;
  if (selectedEvent._wdrgns_locationid_value) {
    const res = await axios.get(
      `${baseUrl}/wdrgns_locations(${selectedEvent._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value`,
      { headers }
    );
    location = res.data;
  }

  let promoterLogo = null;
  if (promoter?.entityimage) {
    const imageRes = await axios.get(
      `${baseUrl}/accounts(${promoter.accountid})/entityimage`,
      {
        headers,
        responseType: "arraybuffer",
      }
    );
    promoterLogo = Buffer.from(imageRes.data, "binary").toString("base64");
  }

  let eventImage = null;
  if (selectedEvent?.wdrgns_image) {
    const imageRes = await axios.get(
      `${baseUrl}/wdrgns_events(${selectedEvent.wdrgns_eventid})/wdrgns_image`,
      {
        headers,
        responseType: "arraybuffer",
      }
    );
    eventImage = Buffer.from(imageRes.data, "binary").toString("base64");
  }

  const result = {
    ticket: {
      id: ticket.wdrgns_ticketid,
      name: ticket.wdrgns_ticket,
      remainingScans: ticket.wdrgns_remainingscans,
      onlineUrl: ticket.wdrgns_onlineticketurl,
      dynamicUrl: ticket.wdrgns_ticketdynamicurl,
    },
    ticketType: ticketType
      ? {
          validFrom: ticketType.wdrgns_validfrom,
          validTo: ticketType.wdrgns_validto,
          enableAskAdam: ticketType.wdrgns_enableaskadam,
        }
      : null,
    contact: contact
      ? {
          id: contact.contactid,
          fullname: contact.fullname,
        }
      : null,
    event: {
      id: selectedEvent.wdrgns_eventid,
      name: selectedEvent.wdrgns_event,
      startDate: selectedEvent.wdrgns_startdate,
      endDate: selectedEvent.wdrgns_enddate,
      openingHours: {
        office: selectedEvent.wdrgns_openinghoursoffice,
        officeBranding: selectedEvent.wdrgns_openinghoursofficebranding,
        cafe: selectedEvent.wdrgns_openinghourscafe,
        fuelShop: selectedEvent.wdrgns_openinghoursfuelshop,
        tyres: selectedEvent.wdrgns_openinghourstyres,
        tyreBranding: selectedEvent.wdrgns_openinghourstyrebranding,
      },
      image: eventImage,
      logo: selectedEvent.wdrgns_logo || null,
    },
    promoter: promoter
      ? {
          id: promoter.accountid,
          name: promoter.name,
          logo: promoterLogo,
        }
      : null,
    location: location
      ? {
          id: location.wdrgns_locationid,
          name: location.wdrgns_location,
          addressLine1: location.wdrgns_addressline1,
          addressLine2: location.wdrgns_addressline2,
          suburbId: location._wdrgns_suburbid_value,
        }
      : null,
  };

  return NextResponse.json(result, {
    status: 200,
  });
}
