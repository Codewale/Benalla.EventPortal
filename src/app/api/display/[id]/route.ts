import { NextResponse } from "next/server";

const axios = require("axios");

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

async function getPromoterLogoAsBase64(accountId, headers, baseUrl) {
  try {
    const res = await axios.get(
      `${baseUrl}/accounts(${accountId})?$select=entityimage,name`,
      { headers }
    );

    const data = res.data;

    if (data.entityimage) {
      return data.entityimage;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching promoter logo:", err.message);
    return null;
  }
}

async function getEventAlerts(eventId, headers, baseUrl) {
  try {
    const filter = `_wdrgns_event_value eq ${eventId} and statecode eq 0`;
    const select =
      "wdrgns_alertcolour,wdrgns_alertimage,wdrgns_alerttext,wdrgns_endtime,wdrgns_starttime,_wdrgns_event_value";
    const url = `${baseUrl}/wdrgns_eventalertses?$filter=${encodeURIComponent(
      filter
    )}&$select=${select}`;

    const res = await axios.get(url, { headers });
    return res.data.value || [];
  } catch (err) {
    console.error(
      "Error fetching event alerts:",
      err.response?.data || err.message
    );
    return [];
  }
}

async function getEventSchedules(eventId, headers, baseUrl) {
  try {
    const filter = `_wdrgns_event_value eq ${eventId} and wdrgns_showontickets eq true and statecode eq 0`;
    const select =
      "wdrgns_starttime,wdrgns_endtime,_wdrgns_event_value,wdrgns_displayorder,wdrgns_item";
    const url = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(
      filter
    )}&$select=${select}`;

    const res = await axios.get(url, { headers });
    return res.data.value || [];
  } catch (err) {
    console.error(
      "Error fetching event schedules:",
      err.response?.data || err.message
    );
    return [];
  }
}

export async function GET(req, { params}) {
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
      `${baseUrl}/contacts(${ticket._wdrgns_contactid_value})?$select=fullname,contactid`,
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
    `${baseUrl}/wdrgns_events?$filter=statecode eq 0&$select=wdrgns_event,wdrgns_eventid,wdrgns_startdate,wdrgns_enddate,_wdrgns_promoterid_value,_wdrgns_locationid_value,wdrgns_openinghourscafe,wdrgns_openinghoursfuelshop,wdrgns_openinghoursoffice,wdrgns_openinghoursofficebranding,wdrgns_openinghourstyres,wdrgns_openinghourstyrebranding,wdrgns_image,wdrgns_logo&$expand=wdrgns_ticket_wdrgns_multievent($filter=wdrgns_ticketid eq ${ticketId})`,
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

  if (!selectedEvent) throw new Error("No related event found.");

  let promoter = null;
  if (selectedEvent._wdrgns_promoterid_value) {
    promoter = await axios
      .get(
        `${baseUrl}/accounts(${selectedEvent._wdrgns_promoterid_value})?$select=name,accountid`,
        { headers }
      )
      .then((res) => res.data);
  }

  let location = null;
  if (selectedEvent._wdrgns_locationid_value) {
    location = await axios
      .get(
        `${baseUrl}/wdrgns_locations(${selectedEvent._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value,wdrgns_locationid`,
        { headers }
      )
      .then((res) => res.data);
  }

  let promoterLogo = null;
  if (promoter?.accountid) {
    promoterLogo = await getPromoterLogoAsBase64(
      promoter.accountid,
      headers,
      baseUrl
    );
  }

  let eventImage = selectedEvent?.wdrgns_image || null;

  const alerts = await getEventAlerts(
    selectedEvent.wdrgns_eventid,
    headers,
    baseUrl
  );
  const eventSchedules = await getEventSchedules(
    selectedEvent.wdrgns_eventid,
    headers,
    baseUrl
  );

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
          enableAskAdam:
            ticketType.wdrgns_enableaskadam === 948090000
              ? "enabled"
              : ticketType.wdrgns_enableaskadam === 948090001
              ? "disabled"
              : null,
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
      startDate: new Date(selectedEvent.wdrgns_startdate).toISOString(),
      endDate: new Date(selectedEvent.wdrgns_enddate).toISOString(),
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
          logo: "data:image/jpeg;base64," + promoterLogo,
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
    eventAlerts: alerts.map((alert) => ({
      id: alert.wdrgns_eventalertsid,
      alertColour: alert.wdrgns_alertcolour,
      alertImage: alert.wdrgns_alertimage,
      alertText: alert.wdrgns_alerttext,
      endTime: alert.wdrgns_endtime,
      startTime: alert.wdrgns_starttime,
      eventId: alert._wdrgns_event_value,
    })),
    eventSchedules: eventSchedules.map((schedule) => ({
      startTime: schedule.wdrgns_starttime,
      endTime: schedule.wdrgns_endtime,
      eventId: schedule._wdrgns_event_value,
      displayOrder: schedule.wdrgns_displayorder,
      item: schedule.wdrgns_item,
      id:schedule.wdrgns_eventscheduleid
    })),
  };

  return NextResponse.json(result, {
    status: 200,
  })

}
