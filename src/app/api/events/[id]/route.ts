import { NextResponse } from "next/server";
import { getAccessToken, getApiConfig, createAuthHeaders } from "../../shared/auth";
import { fetchImageAsBase64, getSponsors } from "../../shared/utils";
import { 
  getEventAlerts, 
  getEventSchedules, 
  getEventDetails, 
  getPromoterAndLocation 
} from "../../shared/events";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    const token = await getAccessToken();
    const { baseUrl } = getApiConfig();
    const headers = createAuthHeaders(token);

    // Get event details first
    const event = await getEventDetails(eventId, headers, baseUrl);
    
    // Fetch all data in parallel
    const [
      alerts,
      schedules,
      { promoter, location, promoterLogo },
      eventImage,
      eventLogo,
      eventMap,
      primarySponsors,
      sponsors
    ] = await Promise.all([
      getEventAlerts(eventId, headers, baseUrl, false), // Get all alerts for events
      getEventSchedules(eventId, headers, baseUrl, true), // Use smart filtering
      getPromoterAndLocation(event, headers, baseUrl),
      event.wdrgns_image ? fetchImageAsBase64('wdrgns_events', event.wdrgns_eventid, 'wdrgns_image', headers, baseUrl) : null,
      event.wdrgns_logo ? fetchImageAsBase64('wdrgns_events', event.wdrgns_eventid, 'wdrgns_logo', headers, baseUrl) : null,
      event.wdrgns_eventmap ? fetchImageAsBase64('wdrgns_events', event.wdrgns_eventid, 'wdrgns_eventmap', headers, baseUrl) : null,
      getSponsors(event.wdrgns_eventid, 'wdrgns_event_primarysponsor', headers, baseUrl),
      getSponsors(event.wdrgns_eventid, 'wdrgns_event_sponsor', headers, baseUrl)
    ]);

    const result = {
      event: {
        id: event.wdrgns_eventid,
        name: event.wdrgns_event,
        startDate: event.wdrgns_startdate,
        endDate: event.wdrgns_enddate,
        onSaleFrom: event.wdrgns_onsalefrom,
        onSaleTo: event.wdrgns_onsaleto,
        descriptionBlurb: event.wdrgns_descriptionblurb,
        openingHours: {
          office: event.wdrgns_openinghoursoffice,
          officeBranding: event.wdrgns_openinghoursofficebranding,
          cafe: event.wdrgns_openinghourscafe,
          fuelShop: event.wdrgns_openinghoursfuelshop,
          tyres: event.wdrgns_openinghourstyres,
          tyreBranding: event.wdrgns_openinghourstyrebranding
        },
        image: eventImage || null,
        logo: eventLogo || null,
        map: eventMap || null
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
      primarySponsors,
      sponsors
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event data' },
      { status: 500 }
    );
  }
}

