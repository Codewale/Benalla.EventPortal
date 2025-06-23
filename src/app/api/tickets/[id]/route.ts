import { NextResponse } from "next/server";
import axios from 'axios';
import { getAccessToken, getApiConfig, createAuthHeaders } from "../../shared/auth";
import { fetchImageAsBase64, getSponsors, getQRCodeBase64 } from "../../shared/utils";
import { getEventAlerts, getEventSchedules } from "../../shared/events";
import { getTicketLinks, getEventDescriptionAndOpeningHours } from "../../shared/tickets";

interface EventData {
  wdrgns_eventid: string;
  wdrgns_startdate: string;
  wdrgns_enddate: string;
  wdrgns_event: string;
  _wdrgns_promoterid_value?: string;
  _wdrgns_locationid_value?: string;
  wdrgns_image?: string;
  wdrgns_logo?: string;
  wdrgns_eventmap?: string;
  wdrgns_ticket_wdrgns_multievent?: Array<unknown>;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const token = await getAccessToken();
    const { baseUrl } = getApiConfig();
    const headers = createAuthHeaders(token);

    // Get ticket details
    const ticketResponse = await axios.get(`${baseUrl}/wdrgns_tickets(${ticketId})`, { headers });
    const ticket = ticketResponse.data;

    // Get contact and ticket type in parallel
    const [contact, ticketType] = await Promise.all([
      ticket._wdrgns_contactid_value
        ? axios.get(`${baseUrl}/contacts(${ticket._wdrgns_contactid_value})?$select=fullname,contactid`, { headers }).then(r => r.data)
        : null,
      ticket._wdrgns_tickettype_value
        ? axios.get(`${baseUrl}/wdrgns_tickettypes(${ticket._wdrgns_tickettype_value})?$select=wdrgns_validfrom,wdrgns_validto,wdrgns_enableaskadam`, { headers }).then(r => r.data)
        : null
    ]);

    // Get related events
    const eventResponse = await axios.get(
      `${baseUrl}/wdrgns_events?$expand=wdrgns_ticket_wdrgns_multievent($filter=wdrgns_ticketid eq ${ticketId})&$filter=statecode eq 0`,
      { headers }
    );    const events: EventData[] = eventResponse.data.value.filter(
      (e: EventData) => e.wdrgns_ticket_wdrgns_multievent?.length > 0
    );
    const now = new Date();

    // Select the most appropriate event
    let selectedEvent: EventData | null = null;
    const futureEvents = events.filter((e: EventData) => new Date(e.wdrgns_startdate) > now);
    futureEvents.sort((a: EventData, b: EventData) => new Date(a.wdrgns_startdate).getTime() - new Date(b.wdrgns_startdate).getTime());
    
    if (futureEvents.length > 0) {
      selectedEvent = futureEvents[0];
    } else {
      const pastEvents = events.filter((e: EventData) => new Date(e.wdrgns_startdate) <= now);
      pastEvents.sort((a: EventData, b: EventData) => new Date(b.wdrgns_startdate).getTime() - new Date(a.wdrgns_startdate).getTime());
      if (pastEvents.length > 0) {
        selectedEvent = pastEvents[0];
      }
    }

    if (!selectedEvent) {
      throw new Error("No related event found.");
    }

    // Fetch all related data in parallel
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
      { description, openingHours },
      qr
    ] = await Promise.all([
      selectedEvent._wdrgns_promoterid_value
        ? axios.get(`${baseUrl}/accounts(${selectedEvent._wdrgns_promoterid_value})?$select=name,accountid`, { headers }).then(r => r.data)
        : null,
      selectedEvent._wdrgns_locationid_value
        ? axios.get(`${baseUrl}/wdrgns_locations(${selectedEvent._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value,wdrgns_locationid`, { headers }).then(r => r.data)
        : null,
      selectedEvent._wdrgns_promoterid_value
        ? axios.get(`${baseUrl}/accounts(${selectedEvent._wdrgns_promoterid_value})?$select=entityimage`, { headers }).then(r => r.data.entityimage || null)
        : null,
      getEventAlerts(selectedEvent.wdrgns_eventid, headers, baseUrl, true), // Only active alerts for tickets
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
      getEventSchedules(selectedEvent.wdrgns_eventid, headers, baseUrl, false), // No smart filtering for tickets
      getEventDescriptionAndOpeningHours(selectedEvent.wdrgns_eventid, headers, baseUrl),
      getQRCodeBase64(baseUrl)
    ]);

    const result = {
      qrCode: qr,
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
        enableAskAdam:
          ticketType.wdrgns_enableaskadam === 948090000 ? 'enabled' :
          ticketType.wdrgns_enableaskadam === 948090001 ? 'disabled' : null
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
        description: description?.replace(/<\/?[^>]+(>|$)/g, '') || null,
        openingHours,
        image: eventImageBase64 || null,
        logo: eventLogoBase64 || null,
        map: eventMapBase64 || null
      },
      promoter: promoter ? {
        id: promoter.accountid,
        name: promoter.name,
        logo: promoterLogo ? `data:image/jpeg;base64,${promoterLogo}` : null
      } : null,
      location: location ? {
        id: location.wdrgns_locationid,
        name: location.wdrgns_location,
        addressLine1: location.wdrgns_addressline1,
        addressLine2: location.wdrgns_addressline2,
        suburbId: location._wdrgns_suburbid_value
      } : null,
      eventAlerts: alerts,
      eventSchedules: schedules,
      ticketLinks,
      primarySponsors,
      sponsors
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in tickets API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket data' },
      { status: 500 }
    );
  }
}
