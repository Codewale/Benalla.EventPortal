import axios from 'axios';

/**
 * Fetch image as base64 from entity
 */
export async function fetchImageAsBase64(
  entitySetName: string,
  recordId: string,
  columnName: string,
  headers: Record<string, string>,
  baseUrl: string
): Promise<string | null> {
  try {
    const url = `${baseUrl}/${entitySetName}(${recordId})/${columnName}/$value`;
    const response = await axios.get(url, {
      headers,
      responseType: 'arraybuffer'
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error(`Error fetching image for ${entitySetName}(${recordId})/${columnName}:`, error);
    return null;
  }
}

/**
 * Get promoter logo as base64
 */
export async function getPromoterLogoAsBase64(
  accountId: string,
  headers: Record<string, string>,
  baseUrl: string
): Promise<string | null> {
  try {
    const response = await axios.get(
      `${baseUrl}/accounts(${accountId})?$select=entityimage`,
      { headers }
    );
    return response.data.entityimage || null;
  } catch (error) {
    console.error(`Error fetching promoter logo for account ${accountId}:`, error);
    return null;
  }
}

/**
 * Get sponsors for an event
 */
export async function getSponsors(
  eventId: string,
  relationshipName: string,
  headers: Record<string, string>,
  baseUrl: string
): Promise<Array<{ name: string; image: string | null }>> {
  try {
    const expand = `${relationshipName}($select=name,entityimage)`;
    const url = `${baseUrl}/wdrgns_events(${eventId})?$expand=${expand}`;
    const response = await axios.get(url, { headers });
    const accounts = response.data?.[relationshipName] || [];
    
    return accounts.map((account: { name: string; entityimage?: string }) => ({
      name: account.name,
      image: account.entityimage ? `data:image/jpeg;base64,${account.entityimage}` : null
    }));
  } catch (error) {
    console.error(`Error fetching sponsors for event ${eventId}:`, error);
    return [];
  }
}

/**
 * Generate QR code as base64
 */
export async function getQRCodeBase64(text: string): Promise<string | null> {
  if (!text) return null;
  
  try {
    const response = await axios.get(
      `https://quickchart.io/qr?text=${encodeURIComponent(text)}`,
      { responseType: 'arraybuffer' }
    );
    return `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}
