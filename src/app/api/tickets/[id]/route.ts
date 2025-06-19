import { NextResponse } from "next/server";

const axios = require('axios');

async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: `${process.env.RESOURCE}/.default`
  });

  const res = await axios.post(url, params);
  return res.data.access_token;
}

async function fetchImageAsBase64(entitySetName, recordId, columnName, headers, baseUrl) {
  try {
    const url = `${baseUrl}/${entitySetName}(${recordId})/${columnName}/$value`;
    const res = await axios.get(url, {
      headers,
      responseType: 'arraybuffer'
    });
    const base64 = Buffer.from(res.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

async function getPromoterLogoAsBase64(accountId, headers, baseUrl) {
  try {
    const res = await axios.get(`${baseUrl}/accounts(${accountId})?$select=entityimage`, { headers });
    return res.data.entityimage || null;
  } catch {
    return null;
  }
}

async function getSponsors(eventId, relationshipName, headers, baseUrl) {
  const expand = `${relationshipName}($select=name,entityimage)`;
  const url = `${baseUrl}/wdrgns_events(${eventId})?$expand=${expand}`;
  const res = await axios.get(url, { headers });
  const accounts = res.data?.[relationshipName] || [];
  return accounts.map(account => ({
    name: account.name,
    image: account.entityimage ? `data:image/jpeg;base64,${account.entityimage}` : null
  }));
}

async function getEventAlerts(eventId, headers, baseUrl) {
  const now = new Date().toISOString();
  const filter = `_wdrgns_event_value eq ${eventId} and statecode eq 0 and wdrgns_starttime le ${now} and wdrgns_endtime gt ${now}`;
  const select = 'wdrgns_alertcolour,wdrgns_alertimage,wdrgns_alerttext,wdrgns_endtime,wdrgns_starttime,_wdrgns_event_value,wdrgns_eventalertsid';
  const url = `${baseUrl}/wdrgns_eventalertses?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_starttime asc`;
  const res = await axios.get(url, { headers });
  return res.data.value || [];
}

async function getEventSchedules(eventId, headers, baseUrl) {
  const now = new Date().toISOString();
  const select = [
    'wdrgns_starttime',
    'wdrgns_endtime',
    '_wdrgns_event_value',
    'wdrgns_item',
    'wdrgns_eventscheduleid',
    'wdrgns_eventnumber',
    'wdrgns_session',
    'wdrgns_time',
    'wdrgns_displayorder'
  ].join(',');

  const filter = `_wdrgns_event_value eq '${eventId}' and wdrgns_showontickets eq true and statecode eq 0`;
  const url = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_starttime asc`;
  const res = await axios.get(url, { headers });
  return res.data.value || [];
}

async function getTicketLinks(ticketTypeId, headers, baseUrl) {
  const filter = `statecode eq 0 and _wdrgns_tickettype_value eq '${ticketTypeId}'`;
  const select = 'wdrgns_displayorder,wdrgns_name,wdrgns_url,wdrgns_linkimage';
  const url = `${baseUrl}/wdrgns_ticketlinkses?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_displayorder asc`;
  const res = await axios.get(url, { headers });
  return res.data.value || [];
}

// async function getTicketDetails(ticketId) {

export async function GET(req, {params}) {
  const ticketId = params.id;
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const ticketRes = await axios.get(`${baseUrl}/wdrgns_tickets(${ticketId})`, { headers });
  const ticket = ticketRes.data;

  const [contact, ticketType] = await Promise.all([
    ticket._wdrgns_contactid_value
      ? axios.get(`${baseUrl}/contacts(${ticket._wdrgns_contactid_value})?$select=fullname,contactid`, { headers }).then(r => r.data)
      : null,
    ticket._wdrgns_tickettype_value
      ? axios.get(`${baseUrl}/wdrgns_tickettypes(${ticket._wdrgns_tickettype_value})?$select=wdrgns_validfrom,wdrgns_validto,wdrgns_enableaskadam`, { headers }).then(r => r.data)
      : null
  ]);

  const eventRes = await axios.get(
    `${baseUrl}/wdrgns_events?$filter=statecode eq 0&$select=wdrgns_descriptionblurb,wdrgns_event,wdrgns_eventid,wdrgns_startdate,wdrgns_enddate,_wdrgns_promoterid_value,_wdrgns_locationid_value,wdrgns_openinghourscafe,wdrgns_openinghoursfuelshop,wdrgns_openinghoursoffice,wdrgns_openinghoursofficebranding,wdrgns_openinghourstyres,wdrgns_openinghourstyrebranding,wdrgns_image,wdrgns_logo,wdrgns_eventmap&$expand=wdrgns_ticket_wdrgns_multievent($filter=wdrgns_ticketid eq ${ticketId})`,
    { headers }
  );

  const events = eventRes.data.value;
  const now = new Date();

  let selectedEvent = null;
  let futureEvents = events.filter(e => new Date(e.wdrgns_startdate) > now);
  futureEvents.sort((a, b) => new Date(a.wdrgns_startdate) - new Date(b.wdrgns_startdate));
  if (futureEvents.length > 0) {
    selectedEvent = futureEvents[0];
  } else {
    let pastEvents = events.filter(e => new Date(e.wdrgns_startdate) <= now);
    pastEvents.sort((a, b) => new Date(b.wdrgns_startdate) - new Date(a.wdrgns_startdate));
    if (pastEvents.length > 0) {
      selectedEvent = pastEvents[0];
    }
  }

  if (!selectedEvent) throw new Error("No related event found.");

  const [promoter, location, promoterLogo, alerts, ticketLinks, primarySponsors, sponsors,
         eventImageBase64, eventLogoBase64, eventMapBase64, alertImagesBase64, schedules] = await Promise.all([
    selectedEvent._wdrgns_promoterid_value
      ? axios.get(`${baseUrl}/accounts(${selectedEvent._wdrgns_promoterid_value})?$select=name,accountid`, { headers }).then(r => r.data)
      : null,
    selectedEvent._wdrgns_locationid_value
      ? axios.get(`${baseUrl}/wdrgns_locations(${selectedEvent._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value,wdrgns_locationid`, { headers }).then(r => r.data)
      : null,
    selectedEvent._wdrgns_promoterid_value
      ? getPromoterLogoAsBase64(selectedEvent._wdrgns_promoterid_value, headers, baseUrl)
      : null,
    getEventAlerts(selectedEvent.wdrgns_eventid, headers, baseUrl),
    ticket._wdrgns_tickettype_value
      ? getTicketLinks(ticket._wdrgns_tickettype_value, headers, baseUrl)
      : [],
    getSponsors(selectedEvent.wdrgns_eventid, 'wdrgns_event_primarysponsor', headers, baseUrl),
    getSponsors(selectedEvent.wdrgns_eventid, 'wdrgns_event_sponsor', headers, baseUrl),
    selectedEvent.wdrgns_image ? fetchImageAsBase64('wdrgns_events', selectedEvent.wdrgns_eventid, 'wdrgns_image', headers, baseUrl) : null,
    selectedEvent.wdrgns_logo ? fetchImageAsBase64('wdrgns_events', selectedEvent.wdrgns_eventid, 'wdrgns_logo', headers, baseUrl) : null,
    selectedEvent.wdrgns_eventmap ? fetchImageAsBase64('wdrgns_events', selectedEvent.wdrgns_eventid, 'wdrgns_eventmap', headers, baseUrl) : null,
    (async () => {
      const alerts = await getEventAlerts(selectedEvent.wdrgns_eventid, headers, baseUrl);
      return Promise.all(
        alerts.map(alert => alert.wdrgns_alertimage ? fetchImageAsBase64('wdrgns_eventalertses', alert.wdrgns_eventalertsid, 'wdrgns_alertimage', headers, baseUrl) : null)
      );
    })(),
    getEventSchedules(selectedEvent.wdrgns_eventid, headers, baseUrl)
  ]);

  const result = {
    ticket: {
      id: ticket.wdrgns_ticketid,
      name: ticket.wdrgns_ticket,
      remainingScans: ticket.wdrgns_remainingscans,
      onlineUrl: ticket.wdrgns_onlineticketurl,
      dynamicUrl: ticket.wdrgns_ticketdynamicurl
    },
    ticketType: ticketType ? {
      validFrom: ticketType.wdrgns_validfrom,
      validTo: ticketType.wdrgns_validto,
      enableAskAdam: ticketType.wdrgns_enableaskadam === 948090000 ? "enabled" : ticketType.wdrgns_enableaskadam === 948090001 ? "disabled" : null
    } : null,
    contact: contact ? {
      id: contact.contactid,
      fullname: contact.fullname
    } : null,
    event: {
      id: selectedEvent.wdrgns_eventid,
      name: selectedEvent.wdrgns_event,
      startDate: selectedEvent.wdrgns_startdate,
      endDate: selectedEvent.wdrgns_enddate,
      description: selectedEvent.wdrgns_descriptionblurb,
      openingHours: {
        office: selectedEvent.wdrgns_openinghoursoffice,
        officeBranding: selectedEvent.wdrgns_openinghoursofficebranding,
        cafe: selectedEvent.wdrgns_openinghourscafe,
        fuelShop: selectedEvent.wdrgns_openinghoursfuelshop,
        tyres: selectedEvent.wdrgns_openinghourstyres,
        tyreBranding: selectedEvent.wdrgns_openinghourstyrebranding
      },
      image: eventImageBase64 || null,
      logo: eventLogoBase64 || null,
      map: eventMapBase64 || null
    },
    promoter: promoter ? {
      id: promoter.accountid,
      name: promoter.name,
      logo: promoterLogo ? "data:image/jpeg;base64," + promoterLogo : null
    } : null,
    location: location ? {
      id: location.wdrgns_locationid,
      name: location.wdrgns_location,
      addressLine1: location.wdrgns_addressline1,
      addressLine2: location.wdrgns_addressline2,
      suburbId: location._wdrgns_suburbid_value
    } : null,
    eventAlerts: alerts.map((alert, i) => ({
      ...alert,
      alertImageBase64: alertImagesBase64[i] || null
    })),
    eventSchedules: schedules,
    ticketLinks,
    primarySponsors,
    sponsors
  };


  return NextResponse.json(result, {
    status: 200
  })
}

