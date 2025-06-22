import { NextResponse } from "next/server";
const axios = require('axios');

// we are using eventId , so that's why I didn't omit it, please check it 

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
    const res = await axios.get(url, { headers, responseType: 'arraybuffer' });
    const base64 = Buffer.from(res.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

async function getEventDetails(headers, baseUrl, eventId) {
  const res = await axios.get(
    `${baseUrl}/wdrgns_events(${eventId})?$select=wdrgns_event,wdrgns_eventid,wdrgns_startdate,wdrgns_enddate,_wdrgns_promoterid_value,_wdrgns_locationid_value,wdrgns_openinghourscafe,wdrgns_openinghoursfuelshop,wdrgns_openinghoursoffice,wdrgns_openinghoursofficebranding,wdrgns_openinghourstyres,wdrgns_openinghourstyrebranding,wdrgns_image,wdrgns_logo,wdrgns_eventmap,wdrgns_onsaleto,wdrgns_onsalefrom,wdrgns_descriptionblurb`,
    { headers }
  );
  return res.data;
}

async function getPromoterLogoAsBase64(accountId, headers, baseUrl) {
  const res = await axios.get(`${baseUrl}/accounts(${accountId})?$select=entityimage`, { headers });
  return res.data.entityimage || null;
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

async function getPromoterAndLocation(event, headers, baseUrl) {
  const [promoter, location, promoterLogo] = await Promise.all([
    event._wdrgns_promoterid_value
      ? axios.get(`${baseUrl}/accounts(${event._wdrgns_promoterid_value})?$select=name,accountid`, { headers }).then(r => r.data)
      : null,
    event._wdrgns_locationid_value
      ? axios.get(`${baseUrl}/wdrgns_locations(${event._wdrgns_locationid_value})?$select=wdrgns_location,wdrgns_addressline1,wdrgns_addressline2,_wdrgns_suburbid_value,wdrgns_locationid`, { headers }).then(r => r.data)
      : null,
    event._wdrgns_promoterid_value
      ? getPromoterLogoAsBase64(event._wdrgns_promoterid_value, headers, baseUrl)
      : null
  ]);

  return { promoter, location, promoterLogo };
}

async function getEventAlerts(headers, baseUrl, eventId) {
  const filter = `_wdrgns_event_value eq ${eventId} and statecode eq 0`;
  const select = 'wdrgns_alertcolour,wdrgns_alertimage,wdrgns_alerttext,wdrgns_endtime,wdrgns_starttime,_wdrgns_event_value,wdrgns_eventalertsid';
  const url = `${baseUrl}/wdrgns_eventalertses?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_starttime asc&$top=1`;
  const res = await axios.get(url, { headers });
  return res.data.value || [];
}

async function getEventSchedules(headers, baseUrl, eventId) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayISOString = today.toISOString();

  const select = [
    'wdrgns_starttime', 'wdrgns_endtime', '_wdrgns_event_value',
    'wdrgns_item', 'wdrgns_eventscheduleid', 'wdrgns_eventnumber',
    'wdrgns_session', 'wdrgns_time', 'wdrgns_displayorder'
  ].join(',');

  const baseFilter = `_wdrgns_event_value eq '${eventId}' and wdrgns_showontickets eq true and statecode eq 0`;

  const futureUrl = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(`${baseFilter} and wdrgns_starttime ge ${todayISOString}`)}&$select=${select}&$orderby=wdrgns_starttime asc`;
  const futureRes = await axios.get(futureUrl, { headers });

  if (futureRes.data.value?.length > 0) {
    return futureRes.data.value.map(item => ({
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

  const pastUrl = `${baseUrl}/wdrgns_eventschedules?$filter=${encodeURIComponent(`${baseFilter} and wdrgns_starttime lt ${todayISOString}`)}&$select=${select}&$orderby=wdrgns_starttime desc`;
  const pastRes = await axios.get(pastUrl, { headers });
  const pastSchedules = pastRes.data.value || [];

  if (pastSchedules.length > 0) {
    const lastDate = pastSchedules[0].wdrgns_starttime.split("T")[0];
    return pastSchedules.filter(item => item.wdrgns_starttime.startsWith(lastDate)).map(item => ({
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
}

export async function GET(req, {params}) {
  const eventId = params.id;
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const event = await getEventDetails(headers, baseUrl, eventId);
  const [alerts, schedules, { promoter, location, promoterLogo },
         eventImage, eventLogo, eventMap, primarySponsors, sponsors] = await Promise.all([
    getEventAlerts(headers, baseUrl, eventId),
    getEventSchedules(headers, baseUrl, eventId),
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
      description: event.wdrgns_descriptionblurb,
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

  return NextResponse.json(result, {
    status: 200
  })
}

