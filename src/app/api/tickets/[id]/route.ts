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

// const baseUrl = process.env.APPSETTING_BASE_URL;

async function fetchImageAsBase64(entitySetName, recordId, columnName, headers, baseUrl) {
  try {
    const url = `${baseUrl}/${entitySetName}(${recordId})/${columnName}/$value`;
    const res = await axios.get(url, {
      headers,
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(res.data);
    const header = buffer.toString('utf8', 0, 20).trim();

    let contentType = res.headers['content-type'];

    // Fallback: detect SVG or PNG manually if Content-Type is missing
    if (!contentType || contentType === 'application/octet-stream') {
      if (header.startsWith('<?xml') || header.includes('<svg')) {
        contentType = 'image/svg+xml';
      } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        contentType = 'image/png';
      } else {
        contentType = 'application/octet-stream';
      }
    }

    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.error(`Failed to fetch image ${columnName} from ${entitySetName}(${recordId}):`, err.message);
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
  const rawAlerts = res.data.value || [];

  // Map keys to friendly names and fetch alert images base64
  const alerts = await Promise.all(
    rawAlerts.map(async (alert) => ({
      id: alert.wdrgns_eventalertsid,
      eventId: alert._wdrgns_event_value,
      alertColour: `#${alert.wdrgns_alertcolour}`,
      alertText: alert.wdrgns_alerttext,
      startTime: alert.wdrgns_starttime,
      endTime: alert.wdrgns_endtime,
      alertImageBase64: alert.wdrgns_alertimage
        ? await fetchImageAsBase64('wdrgns_eventalertses', alert.wdrgns_eventalertsid, 'wdrgns_alertimage', headers, baseUrl)
        : null
    }))
  );

  return alerts;
}

async function getEventSchedules(eventId, headers, baseUrl) {
  const select = [
    'wdrgns_starttime',
    'wdrgns_endtime',
    '_wdrgns_event_value',
    'wdrgns_item',
    'wdrgns_eventscheduleid',
    'wdrgns_eventnumber',
    'wdrgns_session',
    'wdrgns_time',
    'wdrgns_displayorder',
    'wdrgns_displaycolour'
  ].join(',');

  const filter = `_wdrgns_event_value eq '${eventId}' and wdrgns_showontickets eq true and statecode eq 0`;
  const url = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_starttime asc`;
  const res = await axios.get(url, { headers });
  const rawSchedules = res.data.value || [];

  // Map keys to friendly names
  return rawSchedules.map(schedule => ({
    id: schedule.wdrgns_eventscheduleid,
    eventId: schedule._wdrgns_event_value,
    startTime: schedule.wdrgns_starttime,
    endTime: schedule.wdrgns_endtime,
    item: schedule.wdrgns_item,
    eventNumber: schedule.wdrgns_eventnumber,
    session: schedule.wdrgns_session,
    time: schedule.wdrgns_time,
    displayOrder: schedule.wdrgns_displayorder,
    displayColour: schedule.wdrgns_displaycolour ? `#${schedule.wdrgns_displaycolour}` : null,
  }));
}

async function fetchFacilityName(facilityId, headers, baseUrl) {
  const select = ['wdrgns_facility'].join(',');
  const filter = `wdrgns_facilityid eq ${facilityId}`;
  const url = `${baseUrl}/wdrgns_facilities?$filter=${filter}&$select=${select}`;

  const res = await axios.get(url, { headers });
  return res.data.value?.[0]?.wdrgns_facility || "";
}

async function getBookings(ticketId, headers, baseUrl) {
  const select = [
    'wdrgns_booking',
    '_wdrgns_contactid_value',
    '_wdrgns_masterticketid_value',
    'wdrgns_from',
    'wdrgns_to',
    '_wdrgns_facilityid_value'
  ].join(',');

  const filter = `_wdrgns_masterticketid_value eq ${ticketId}`;
  const url = `${baseUrl}/wdrgns_bookings?$filter=${filter}&$select=${select}`;

  const res = await axios.get(url, { headers });
  const rawBookings = res.data.value || [];

  const bookings = await Promise.all(
    rawBookings.map(async (b) => ({
      booking: b.wdrgns_booking || "",
      contactId: b._wdrgns_contactid_value || "",
      masterTicketId: b._wdrgns_masterticketid_value || "",
      from: b.wdrgns_from || "",
      to: b.wdrgns_to || "",
      facility: b._wdrgns_facilityid_value
        ? await fetchFacilityName(b._wdrgns_facilityid_value, headers, baseUrl)
        : "",
    }))
  );

  return bookings;
}

async function getVehicle(vehicleId) {
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const select = [
    'wdrgns_primaryidentifier',
    'wdrgns_vin',
    'wdrgns_chassisnumber',
    'wdrgns_registrationplate',
    'wdrgns_racenumber',
    '_wdrgns_nominatedvehicletypeid_value'
  ].join(',');

  const filter = `wdrgns_vehicleid eq ${vehicleId}`;
  const url = `${baseUrl}/wdrgns_vehicles?$filter=${filter}&$select=${select}`;

  const res = await axios.get(url, { headers });
  const vehicles = res.data.value || [];

  if (vehicles.length === 0) return null; // No vehicle found

  const vehicle = vehicles[0];
  const nominatedVehicle = await getNominatedVehicleName(
    vehicle._wdrgns_nominatedvehicletypeid_value,
    headers,
    baseUrl
  );

  return {
    vehicle: vehicle.wdrgns_primaryidentifier || "",
    vin: vehicle.wdrgns_vin || "",
    chassis: vehicle.wdrgns_chassisnumber || "",
    registration: vehicle.wdrgns_registrationplate || "",
    race: vehicle.wdrgns_racenumber || "",
    type: nominatedVehicle || ""
  };
}

async function getNominatedVehicleName(nominatedVehicleId, headers, baseUrl) {
  console.log("Vehicle Id :", nominatedVehicleId);

  if (!nominatedVehicleId) return "";
  const url = `${baseUrl}/wdrgns_vehicletypes(${nominatedVehicleId})?$select=wdrgns_type`;
  const res = await axios.get(url, { headers });
  return res.data.wdrgns_type || "";
}


async function getTicketLinks(ticketTypeId, headers, baseUrl) {
  const filter = `statecode eq 0 and _wdrgns_tickettype_value eq '${ticketTypeId}'`;
  const select = 'wdrgns_displayorder,wdrgns_name,wdrgns_url,wdrgns_linkimage,wdrgns_type';
  const url = `${baseUrl}/wdrgns_ticketlinkses?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_displayorder asc`;

  const res = await axios.get(url, {
    headers: {
      ...headers,
      'Prefer': 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
    },
  });



  const rawLinks = res.data.value || [];

  const ticketLinks = await Promise.all(
    rawLinks.map(async (link) => {
      let linkImageBase64 = null;

      if (link.wdrgns_linkimage) {
        try {
          const imageResponse = await axios.get(
            `${baseUrl}/wdrgns_ticketlinkses(${link.wdrgns_ticketlinksid})/wdrgns_linkimage/$value`,
            { headers, responseType: 'arraybuffer' }
          );

          // Detect content type correctly
          let contentType = imageResponse.headers['content-type'] || 'application/octet-stream';

          // If still unknown, attempt manual detection (rare)
          const buffer = Buffer.from(imageResponse.data);
          if (contentType === 'application/octet-stream') {
            const header = buffer.toString('utf8', 0, 50);
            if (header.includes('<svg') || header.includes('<?xml')) {
              contentType = 'image/svg+xml';
            } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
              contentType = 'image/png';
            } else if (
              buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
            ) {
              contentType = 'image/jpeg';
            }
          }

          const base64Image = buffer.toString('base64');
          linkImageBase64 = `data:${contentType};base64,${base64Image}`;
        } catch (error) {
          console.error(`Failed to fetch image for ticket link ${link.wdrgns_ticketlinksid}`, error.message);
        }
      }

      return {
        displayOrder: link.wdrgns_displayorder,
        name: link.wdrgns_name,
        url: link.wdrgns_url,
        linkImageBase64,
        type: link.wdrgns_type,
        typeLabel: link['wdrgns_type@OData.Community.Display.V1.FormattedValue'] || null,
      };
    })
  );

  return ticketLinks;
}

async function getQRCodeBase64(text, headers) {
  if (!text) return null;
  try {
    const qrText = process.env.QR_BASE_URL + text
    const res = await axios.get(`https://quickchart.io/qr?text=${encodeURIComponent(qrText)}`, { responseType: 'arraybuffer' });
    return `data:image/png;base64,${Buffer.from(res.data).toString('base64')}`;
  } catch {
    return null;
  }
}

// async function getTicketDetails(ticketId) {

export async function GET(req, { params }) {

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
    `${baseUrl}/wdrgns_events?$expand=wdrgns_ticket_wdrgns_multievent($filter=wdrgns_ticketid eq ${ticketId})&$filter=statecode eq 0`,
    { headers }
  );

  const events = eventRes.data.value.filter(
    e => e.wdrgns_ticket_wdrgns_multievent?.length > 0
  );
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

  // Fetch related data in parallel
  const [
    promoter,
    location,
    promoterLogo,
    alerts,
    ticketLinks,
    primarySponsors,
    sponsors,
    eventImageBase64,
    eventLogoBase64,
    eventMapBase64,
    schedules,
    bookings,
    vehicle,
    vehicleImage
  ] = await Promise.all([
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
    selectedEvent.wdrgns_image
      ? fetchImageAsBase64('wdrgns_events', selectedEvent.wdrgns_eventid, 'wdrgns_image', headers, baseUrl)
      : null,
    selectedEvent.wdrgns_logo
      ? fetchImageAsBase64('wdrgns_events', selectedEvent.wdrgns_eventid, 'wdrgns_logo', headers, baseUrl)
      : null,
    selectedEvent.wdrgns_eventmap
      ? fetchImageAsBase64('wdrgns_events', selectedEvent.wdrgns_eventid, 'wdrgns_eventmap', headers, baseUrl)
      : null,
    getEventSchedules(selectedEvent.wdrgns_eventid, headers, baseUrl),
    getBookings(ticketId, headers, baseUrl),
    ticket._wdrgns_nominatedvehicleid_value ?
      getVehicle(ticket._wdrgns_nominatedvehicleid_value)
      : [],
    ticket._wdrgns_nominatedvehicleid_value ?
      fetchImageAsBase64('wdrgns_vehicles', ticket._wdrgns_nominatedvehicleid_value, 'wdrgns_image', headers, baseUrl)
      : []
  ]);
  const suburbCoordinates = location
    ? await getSuburbCoordinates(
      location._wdrgns_suburbid_value,
      headers,
      baseUrl
    )
    : null;
  async function getEventDescriptionAndOpeningHours(eventId, headers, baseUrl) {
    try {
      const selectFields = [
        'wdrgns_descriptionblurb',
        'wdrgns_openinghoursoffice',
        'wdrgns_openinghoursofficebranding',
        'wdrgns_openinghourscafe',
        'wdrgns_openinghoursfuelshop',
        'wdrgns_openinghourstyres',
        'wdrgns_openinghourstyrebranding',
        'wdrgns_ticket1stline',
        'wdrgns_ticket2ndline',
        'wdrgns_ticket3rdline',
      ].join(',');

      const url = `${baseUrl}/wdrgns_events(${eventId})?$select=${selectFields}`;

      const res = await axios.get(url, { headers });

      return {
        description: res.data?.wdrgns_descriptionblurb || null,
        openingHours: {
          office: res.data?.wdrgns_openinghoursoffice || null,
          officeBranding: res.data?.wdrgns_openinghoursofficebranding || null,
          cafe: res.data?.wdrgns_openinghourscafe || null,
          fuelShop: res.data?.wdrgns_openinghoursfuelshop || null,
          tyres: res.data?.wdrgns_openinghourstyres || null,
          tyreBranding: res.data?.wdrgns_openinghourstyrebranding || null
        },
        firstLine: res.data?.wdrgns_ticket1stline || null,
        secondLine: res.data?.wdrgns_ticket2ndline || null,
        thirdLine: res.data?.wdrgns_ticket3rdline || null,
        color: res.data?.wdrgns_eventcolour || null
      };
    } catch (err) {
      console.error("Failed to fetch event description/opening hours:", err.message);
      return {
        description: null,
        openingHours: {
          office: null,
          officeBranding: null,
          cafe: null,
          fuelShop: null,
          tyres: null,
          tyreBranding: null
        },
        secondLine: null,
        thirdLine: null
      };
    }
  }

  const { description, openingHours, firstLine, secondLine, thirdLine, color } = await getEventDescriptionAndOpeningHours(
    selectedEvent.wdrgns_eventid,
    headers,
    baseUrl
  );

  async function getSuburbCoordinates(suburbId, headers, baseUrl) {
    if (!suburbId) return null;

    try {
      const select = 'wdrgns_latitude,wdrgns_longitude';
      const url = `${baseUrl}/wdrgns_suburbs(${suburbId})?$select=${select}`;

      const res = await axios.get(url, { headers });

      return {
        latitude: res.data.wdrgns_latitude || null,
        longitude: res.data.wdrgns_longitude || null,
      };
    } catch (err) {
      console.error(`Failed to fetch suburb coordinates for ID ${suburbId}:`, err.message);
      return null;
    }
  }

  const qr = await getQRCodeBase64(ticketId, headers);

  const result = {
    qrCode: qr,
    ticket: {
      id: ticket.wdrgns_ticketid,
      name: ticket.wdrgns_ticket,
      remainingScans: ticket.wdrgns_remainingscans,
      onlineUrl: ticket.wdrgns_onlineticketurl,
      dynamicUrl: ticket.wdrgns_ticketdynamicurl
    },
    ticketType: ticketType
      ? {
        validFrom: ticketType.wdrgns_validfrom,
        validTo: ticketType.wdrgns_validto,
        enableAskAdam:
          ticketType.wdrgns_enableaskadam === 948090000
            ? 'enabled'
            : ticketType.wdrgns_enableaskadam === 948090001
              ? 'disabled'
              : null
      }
      : null,
    contact: contact
      ? {
        id: contact.contactid,
        fullname: contact.fullname
      }
      : null,
    event: {
      id: selectedEvent.wdrgns_eventid,
      name: selectedEvent.wdrgns_event,
      startDate: selectedEvent.wdrgns_startdate,
      endDate: selectedEvent.wdrgns_enddate,
      description: description?.replace(/<\/?[^>]+(>|$)/g, '') || null,
      openingHours,
      image: eventImageBase64 || null,
      logo: eventLogoBase64 || null,
      map: eventMapBase64 || null,
      firstLine: firstLine || null,
      secondLine: secondLine || null,
      thirdLine: thirdLine || null,
    },
    promoter: promoter
      ? {
        id: promoter.accountid,
        name: promoter.name,
        logo: promoterLogo ? 'data:image/jpeg;base64,' + promoterLogo : null
      }
      : null,
    location: location
      ? {
        id: location.wdrgns_locationid,
        name: location.wdrgns_location,
        addressLine1: location.wdrgns_addressline1,
        addressLine2: location.wdrgns_addressline2,
        suburbId: location._wdrgns_suburbid_value,
        suburbCoordinates
      }
      : null,
    eventAlerts: alerts,
    eventSchedules: schedules,
    ticketLinks,
    primarySponsors,
    sponsors,
    bookings,
    vehicle,
    vehicleImage
  };

  console.log("Result", result);


  return NextResponse.json(result, {
    status: 200,
  })
}
