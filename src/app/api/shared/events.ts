import axios from 'axios';

interface RawEventAlert {
  wdrgns_eventalertsid: string;
  _wdrgns_event_value: string;
  wdrgns_alertcolour?: string;
  wdrgns_alerttext: string;
  wdrgns_starttime: string;
  wdrgns_endtime: string;
  wdrgns_alertimage?: string;
}

interface RawEventSchedule {
  wdrgns_eventscheduleid: string;
  _wdrgns_event_value: string;
  wdrgns_starttime: string;
  wdrgns_endtime: string;
  wdrgns_item: string;
  wdrgns_eventnumber?: number;
  wdrgns_session?: string;
  wdrgns_time?: string;
  wdrgns_displayorder?: number;
}

interface EventAlert {
  id: string;
  eventId: string;
  alertColour: string;
  alertText: string;
  startTime: string;
  endTime: string;
  alertImage?: string | null;
}

interface EventSchedule {
  id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  item: string;
  eventNumber?: number;
  session?: string;
  time?: string;
  displayOrder?: number;
}

interface EventDetails {
  wdrgns_eventid: string;
  wdrgns_event: string;
  wdrgns_startdate: string;
  wdrgns_enddate: string;
  _wdrgns_promoterid_value?: string;
  _wdrgns_locationid_value?: string;
  wdrgns_openinghourscafe?: string;
  wdrgns_openinghoursfuelshop?: string;
  wdrgns_openinghoursoffice?: string;
  wdrgns_openinghoursofficebranding?: string;
  wdrgns_openinghourstyres?: string;
  wdrgns_openinghourstyrebranding?: string;
  wdrgns_image?: string;
  wdrgns_logo?: string;
  wdrgns_eventmap?: string;
  wdrgns_onsaleto?: string;
  wdrgns_onsalefrom?: string;
  wdrgns_descriptionblurb?: string;
}

/**
 * Get event alerts (filtered by active status for tickets, all for events)
 */
export async function getEventAlerts(
  eventId: string,
  headers: Record<string, string>,
  baseUrl: string,
  onlyActive: boolean = false
): Promise<EventAlert[]> {
  try {
    const now = new Date().toISOString();
    const baseFilter = `_wdrgns_event_value eq ${eventId} and statecode eq 0`;
    const timeFilter = onlyActive ? ` and wdrgns_starttime le ${now} and wdrgns_endtime gt ${now}` : '';
    const filter = baseFilter + timeFilter;
    
    const select = 'wdrgns_alertcolour,wdrgns_alertimage,wdrgns_alerttext,wdrgns_endtime,wdrgns_starttime,_wdrgns_event_value,wdrgns_eventalertsid';
    const url = `${baseUrl}/wdrgns_eventalertses?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_starttime asc`;
    
    const response = await axios.get(url, { headers });
    const rawAlerts = response.data.value || [];

    return rawAlerts.map((alert: RawEventAlert) => ({
      id: alert.wdrgns_eventalertsid,
      eventId: alert._wdrgns_event_value,
      alertColour: alert.wdrgns_alertcolour ? `#${alert.wdrgns_alertcolour}` : '#FEE2E2',
      alertText: alert.wdrgns_alerttext,
      startTime: alert.wdrgns_starttime,
      endTime: alert.wdrgns_endtime,
      alertImage: alert.wdrgns_alertimage || null
    }));
  } catch (error) {
    console.error(`Error fetching event alerts for event ${eventId}:`, error);
    return [];
  }
}

/**
 * Get event schedules with smart filtering (future first, then latest past)
 */
export async function getEventSchedules(
  eventId: string,
  headers: Record<string, string>,
  baseUrl: string,
  useSmartFiltering: boolean = false
): Promise<EventSchedule[]> {
  try {
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

    const baseFilter = `_wdrgns_event_value eq '${eventId}' and wdrgns_showontickets eq true and statecode eq 0`;

    if (!useSmartFiltering) {
      // Simple approach: get all schedules
      const url = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(baseFilter)}&$select=${select}&$orderby=wdrgns_starttime asc`;
      const response = await axios.get(url, { headers });
      const rawSchedules = response.data.value || [];

      return rawSchedules.map((schedule: RawEventSchedule) => ({
        id: schedule.wdrgns_eventscheduleid,
        eventId: schedule._wdrgns_event_value,
        startTime: schedule.wdrgns_starttime,
        endTime: schedule.wdrgns_endtime,
        item: schedule.wdrgns_item,
        eventNumber: schedule.wdrgns_eventnumber,
        session: schedule.wdrgns_session,
        time: schedule.wdrgns_time,
        displayOrder: schedule.wdrgns_displayorder
      }));
    }

    // Smart filtering approach for events API
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayISOString = today.toISOString();

    // Try future events first
    const futureUrl = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(`${baseFilter} and wdrgns_starttime ge ${todayISOString}`)}&$select=${select}&$orderby=wdrgns_starttime asc`;
    const futureResponse = await axios.get(futureUrl, { headers });

    if (futureResponse.data.value?.length > 0) {
      return futureResponse.data.value.map((item: RawEventSchedule) => ({
        startTime: item.wdrgns_starttime,
        endTime: item.wdrgns_endtime,
        eventId: item._wdrgns_event_value,
        item: item.wdrgns_item,
        id: item.wdrgns_eventscheduleid,
        displayOrder: item.wdrgns_displayorder,
        eventNumber: item.wdrgns_eventnumber,
        session: item.wdrgns_session,
        time: item.wdrgns_time
      }));
    }

    // Fallback to past events
    const pastUrl = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(`${baseFilter} and wdrgns_starttime lt ${todayISOString}`)}&$select=${select}&$orderby=wdrgns_starttime desc`;
    const pastResponse = await axios.get(pastUrl, { headers });
    const pastSchedules = pastResponse.data.value || [];

    if (pastSchedules.length > 0) {
      const lastDate = pastSchedules[0].wdrgns_starttime.split("T")[0];
      return pastSchedules
        .filter((item: RawEventSchedule) => item.wdrgns_starttime.startsWith(lastDate))
        .map((item: RawEventSchedule) => ({
          startTime: item.wdrgns_starttime,
          endTime: item.wdrgns_endtime,
          eventId: item._wdrgns_event_value,
          item: item.wdrgns_item,
          id: item.wdrgns_eventscheduleid,
          eventNumber: item.wdrgns_eventnumber,
          session: item.wdrgns_session,
          time: item.wdrgns_time
        }));
    }

    return [];
  } catch (error) {
    console.error(`Error fetching event schedules for event ${eventId}:`, error);
    return [];
  }
}

/**
 * Get event details by ID
 */
export async function getEventDetails(
  eventId: string,
  headers: Record<string, string>,
  baseUrl: string
): Promise<EventDetails> {
  const response = await axios.get(
    `${baseUrl}/wdrgns_events(${eventId})?$select=wdrgns_event,wdrgns_eventid,wdrgns_startdate,wdrgns_enddate,_wdrgns_promoterid_value,_wdrgns_locationid_value,wdrgns_openinghourscafe,wdrgns_openinghoursfuelshop,wdrgns_openinghoursoffice,wdrgns_openinghoursofficebranding,wdrgns_openinghourstyres,wdrgns_openinghourstyrebranding,wdrgns_image,wdrgns_logo,wdrgns_eventmap,wdrgns_onsaleto,wdrgns_onsalefrom,wdrgns_descriptionblurb`,
    { headers }
  );
  return response.data;
}

/**
 * Get promoter and location data in parallel
 */
export async function getPromoterAndLocation(
  event: EventDetails,
  headers: Record<string, string>,
  baseUrl: string
) {
  const [promoter, location, promoterLogo] = await Promise.all([
    event._wdrgns_promoterid_value
      ? axios.get(`${baseUrl}/accounts(${event._wdrgns_promoterid_value})?$select=name,accountid`, { headers }).then(r => r.data)
      : null,
    event._wdrgns_locationid_value
      ? axios.get(`${baseUrl}/wdrgns_locations(${event._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value,wdrgns_locationid`, { headers }).then(r => r.data)
      : null,
    event._wdrgns_promoterid_value
      ? axios.get(`${baseUrl}/accounts(${event._wdrgns_promoterid_value})?$select=entityimage`, { headers }).then(r => r.data.entityimage || null)
      : null
  ]);

  return { promoter, location, promoterLogo };
}
