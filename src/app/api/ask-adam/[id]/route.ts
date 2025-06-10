import { NextResponse } from "next/server";

const axios = require('axios');

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: `${process.env.RESOURCE}/.default`
  });

  const res = await axios.post(tokenUrl, params);
  return res.data.access_token;
}


export async function GET(req, { params }) {
    const ticketId = params.id;
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const select = 'wdrgns_askadamid,createdon,wdrgns_question,wdrgns_reply,_wdrgns_ticket_value,_wdrgns_askadam_value';

  const filter = `_wdrgns_ticket_value eq ${ticketId}`;

  const orderby = 'createdon asc';

  const askAdamUrl = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=${orderby}`;

  try {
    const res = await axios.get(askAdamUrl, { headers });
    const records = res.data.value;

    const chats = records.map(e => ({
      AskAdamId: e._wdrgns_askadam_value || null,  
      CreatedOn: e.createdon || null,
      Question: e.wdrgns_question || null,
      Answer: e.wdrgns_reply || null,
      TicketId: e._wdrgns_ticket_value || null,
      GUID: e.wdrgns_askadamid || null
    }));

    return NextResponse.json(chats);

  } catch (err) {
    console.error("Error fetching AskAdam chats:", err.response?.data?.error || err.message);
    return [];
  }
}


