import axios from 'axios';

interface RawTicketLink {
  wdrgns_displayorder: number;
  wdrgns_name: string;
  wdrgns_url: string;
  wdrgns_linkimage?: string;
}

interface TicketLink {
  displayOrder: number;
  name: string;
  url: string;
  linkImageBase64: string | null;
}

/**
 * Get ticket links for a ticket type
 */
export async function getTicketLinks(
  ticketTypeId: string,
  headers: Record<string, string>,
  baseUrl: string
): Promise<TicketLink[]> {
  try {
    const filter = `statecode eq 0 and _wdrgns_tickettype_value eq '${ticketTypeId}'`;
    const select = 'wdrgns_displayorder,wdrgns_name,wdrgns_url,wdrgns_linkimage';
    const url = `${baseUrl}/wdrgns_ticketlinkses?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=wdrgns_displayorder asc`;
    
    const response = await axios.get(url, { headers });
    const rawLinks = response.data.value || [];

    return Promise.all(
      rawLinks.map(async (link: RawTicketLink) => ({
        displayOrder: link.wdrgns_displayorder,
        name: link.wdrgns_name,
        url: link.wdrgns_url,
        linkImageBase64: link.wdrgns_linkimage
          ? `data:image/jpeg;base64,${link.wdrgns_linkimage}`
          : null
      }))
    );
  } catch (error) {
    console.error(`Error fetching ticket links for ticket type ${ticketTypeId}:`, error);
    return [];
  }
}

/**
 * Get event description and opening hours
 */
export async function getEventDescriptionAndOpeningHours(
  eventId: string,
  headers: Record<string, string>,
  baseUrl: string
) {
  try {
    const selectFields = [
      'wdrgns_descriptionblurb',
      'wdrgns_openinghoursoffice',
      'wdrgns_openinghoursofficebranding',
      'wdrgns_openinghourscafe',
      'wdrgns_openinghoursfuelshop',
      'wdrgns_openinghourstyres',
      'wdrgns_openinghourstyrebranding'
    ].join(',');

    const url = `${baseUrl}/wdrgns_events(${eventId})?$select=${selectFields}`;
    const response = await axios.get(url, { headers });

    return {
      description: response.data?.wdrgns_descriptionblurb || null,
      openingHours: {
        office: response.data?.wdrgns_openinghoursoffice || null,
        officeBranding: response.data?.wdrgns_openinghoursofficebranding || null,
        cafe: response.data?.wdrgns_openinghourscafe || null,
        fuelShop: response.data?.wdrgns_openinghoursfuelshop || null,
        tyres: response.data?.wdrgns_openinghourstyres || null,
        tyreBranding: response.data?.wdrgns_openinghourstyrebranding || null
      }
    };
  } catch (error) {
    console.error("Failed to fetch event description/opening hours:", error);
    return {
      description: null,
      openingHours: {
        office: null,
        officeBranding: null,
        cafe: null,
        fuelShop: null,
        tyres: null,
        tyreBranding: null
      }
    };
  }
}
