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
      `${baseUrl}/accounts(${accountId})?$select=entityimage`,
      { headers }
    );
    return res.data.entityimage || null;
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
    )}&$select=${select}&$orderby=wdrgns_starttime asc&$top=1`;

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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Use UTC since backend stores in UTC
    const todayISOString = today.toISOString();

    const select = [
      "wdrgns_starttime",
      "wdrgns_endtime",
      "_wdrgns_event_value",
      "wdrgns_item",
      "wdrgns_eventscheduleid",
      "wdrgns_eventnumber",
      "wdrgns_session",
      "wdrgns_time",
      "wdrgns_displayorder",
    ].join(",");

    const baseFilter = `_wdrgns_event_value eq '${eventId}' and wdrgns_showontickets eq true and statecode eq 0`;

    // 1. Try to get today's and future schedules
    const futureFilter = `${baseFilter} and wdrgns_starttime ge ${todayISOString}`;
    const futureUrl = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(
      futureFilter
    )}&$select=${select}&$orderby=wdrgns_starttime asc`;
    const futureRes = await axios.get(futureUrl, { headers });
    const futureSchedules = futureRes.data.value || [];

    if (futureSchedules.length > 0) {
      return futureSchedules.map((item) => ({
        startTime: item.wdrgns_starttime,
        endTime: item.wdrgns_endtime,
        eventId: item._wdrgns_event_value,
        item: item.wdrgns_item,
        id: item.wdrgns_eventscheduleid,
        displayOrder: item.wdrgns_displayorder,
        eventNumber: item.wdrgns_eventnumber,
        session: item.wdrgns_session,
        time: item.wdrgns_time,
      }));
    }

    // 2. Fallback: get the latest past schedules (closest to today)
    const pastFilter = `${baseFilter} and wdrgns_starttime lt ${todayISOString}`;
    const pastUrl = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(
      pastFilter
    )}&$select=${select}&$orderby=wdrgns_starttime desc`;
    const pastRes = await axios.get(pastUrl, { headers });
    const pastSchedules = pastRes.data.value || [];

    if (pastSchedules.length > 0) {
      const lastDate = pastSchedules[0].wdrgns_starttime.split("T")[0];
      return pastSchedules
        .filter((item) => item.wdrgns_starttime.startsWith(lastDate))
        .map((item) => ({
          startTime: item.wdrgns_starttime,
          endTime: item.wdrgns_endtime,
          eventId: item._wdrgns_event_value,
          item: item.wdrgns_item,
          id: item.wdrgns_eventscheduleid,
          eventNumber: item.wdrgns_eventnumber,
          session: item.wdrgns_session,
          time: item.wdrgns_time,
        }));
    }

    return [];
  } catch (err) {
    console.error(
      "Error fetching event schedules:",
      err.response?.data || err.message
    );
    return [];
  }
}

async function getTicketLinks(ticketTypeId, headers, baseUrl) {
  try {
    const filter = `statecode eq 0 and _wdrgns_tickettype_value eq '${ticketTypeId}'`;
    const select =
      "wdrgns_displayorder,wdrgns_name,wdrgns_url,wdrgns_linkimage";
    const url = `${baseUrl}/wdrgns_ticketlinkses?$filter=${encodeURIComponent(
      filter
    )}&$select=${select}&$orderby=wdrgns_displayorder asc`;

    const res = await axios.get(url, { headers });
    return res.data.value || [];
  } catch (err) {
    console.error(
      "Error fetching ticket links:",
      err.response?.data || err.message
    );
    return [];
  }
}

// export async function getTicketDetails(ticketId) {
export async function GET(req, { params }) {
  const ticketId = params.id;  
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const ticketRes = await axios.get(`${baseUrl}/wdrgns_tickets(${ticketId})`, {
    headers,
  });
  const ticket = ticketRes.data;

  const [contact, ticketType] = await Promise.all([
    ticket._wdrgns_contactid_value
      ? axios
          .get(
            `${baseUrl}/contacts(${ticket._wdrgns_contactid_value})?$select=fullname,contactid`,
            { headers }
          )
          .then((r) => r.data)
      : null,
    ticket._wdrgns_tickettype_value
      ? axios
          .get(
            `${baseUrl}/wdrgns_tickettypes(${ticket._wdrgns_tickettype_value})?$select=wdrgns_validfrom,wdrgns_validto,wdrgns_enableaskadam`,
            { headers }
          )
          .then((r) => r.data)
      : null,
  ]);

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

  const [promoter, location, promoterLogo, alerts, schedules, ticketLinks] =
    await Promise.all([
      selectedEvent._wdrgns_promoterid_value
        ? axios
            .get(
              `${baseUrl}/accounts(${selectedEvent._wdrgns_promoterid_value})?$select=name,accountid`,
              { headers }
            )
            .then((r) => r.data)
        : null,
      selectedEvent._wdrgns_locationid_value
        ? axios
            .get(
              `${baseUrl}/wdrgns_locations(${selectedEvent._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value,wdrgns_locationid`,
              { headers }
            )
            .then((r) => r.data)
        : null,
      selectedEvent._wdrgns_promoterid_value
        ? getPromoterLogoAsBase64(
            selectedEvent._wdrgns_promoterid_value,
            headers,
            baseUrl
          )
        : null,
      getEventAlerts(selectedEvent.wdrgns_eventid, headers, baseUrl),
      getEventSchedules(selectedEvent.wdrgns_eventid, headers, baseUrl),
      ticket._wdrgns_tickettype_value
        ? getTicketLinks(ticket._wdrgns_tickettype_value, headers, baseUrl)
        : [],
    ]);

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
      image: selectedEvent.wdrgns_image,
      logo: selectedEvent.wdrgns_logo || null,
    },
    promoter: promoter
      ? {
          id: promoter.accountid,
          name: promoter.name,
          logo: promoterLogo ? "data:image/jpeg;base64," + promoterLogo : null,
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
    eventSchedules: schedules,
    ticketLinks: ticketLinks.map((link) => ({
      displayOrder: link.wdrgns_displayorder,
      name: link.wdrgns_name,
      url: link.wdrgns_url,
      linkImage: link.wdrgns_linkimage,
    })),
  };
  return NextResponse.json(result, {
    status: 200,
  });

}


