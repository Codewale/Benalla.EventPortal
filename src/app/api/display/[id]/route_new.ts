import { NextResponse } from "next/server";
import axios from 'axios';
import { getAccessToken, getApiConfig, createAuthHeaders } from "../../shared/auth";
import { getEventSchedules } from "../../shared/events";
import { getTicketLinks } from "../../shared/tickets";

interface EventData {
  wdrgns_eventid: string;
  wdrgns_startdate: string;
  wdrgns_enddate: string;
  wdrgns_event: string;
  wdrgns_ticket_wdrgns_multievent?: Array<unknown>;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const token = await getAccessToken();
    const { baseUrl } = getApiConfig();
    const headers = createAuthHeaders(token);

    // Get ticket details to find ticket type
    const ticketResponse = await axios.get(`${baseUrl}/wdrgns_tickets(${ticketId})`, { headers });
    const ticket = ticketResponse.data;

    // Get related events
    const eventResponse = await axios.get(
      `${baseUrl}/wdrgns_events?$expand=wdrgns_ticket_wdrgns_multievent($filter=wdrgns_ticketid eq ${ticketId})&$filter=statecode eq 0`,
      { headers }
    );

    const events: EventData[] = eventResponse.data.value.filter(
      (e: EventData) => e.wdrgns_ticket_wdrgns_multievent?.length > 0
    );

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'No events found for this ticket' },
        { status: 404 }
      );
    }

    // Select the most appropriate event (same logic as tickets API)
    const now = new Date();
    let selectedEvent: EventData | null = null;

    const futureEvents = events.filter((e: EventData) => 
      new Date(e.wdrgns_startdate) > now
    );
    
    if (futureEvents.length > 0) {
      futureEvents.sort((a: EventData, b: EventData) => 
        new Date(a.wdrgns_startdate).getTime() - new Date(b.wdrgns_startdate).getTime()
      );
      selectedEvent = futureEvents[0];
    } else {
      const pastEvents = events.filter((e: EventData) => 
        new Date(e.wdrgns_startdate) <= now
      );
      pastEvents.sort((a: EventData, b: EventData) => 
        new Date(b.wdrgns_startdate).getTime() - new Date(a.wdrgns_startdate).getTime()
      );
      if (pastEvents.length > 0) {
        selectedEvent = pastEvents[0];
      }
    }

    if (!selectedEvent) {
      return NextResponse.json(
        { error: 'No suitable event found' },
        { status: 404 }
      );
    }

    // Get event schedules and ticket links in parallel
    const [eventSchedules, ticketLinks] = await Promise.all([
      getEventSchedules(selectedEvent.wdrgns_eventid, headers, baseUrl, true), // Use smart filtering
      ticket._wdrgns_tickettype_value
        ? getTicketLinks(ticket._wdrgns_tickettype_value, headers, baseUrl)
        : []
    ]);

    const result = {
      eventSchedules,
      ticketLinks
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in display API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch display data' },
      { status: 500 }
    );
  }
}
