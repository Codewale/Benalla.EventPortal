import { NextResponse, NextRequest } from "next/server";

const axios = require("axios");

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID as string,
    client_secret: process.env.CLIENT_SECRET as string,
    scope: `${process.env.RESOURCE as string}/.default`,
  });

  const res = await axios.post(tokenUrl, params);
  return res.data.access_token;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const ticketId = params.id;
  const token = await getAccessToken();
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const select =
    "wdrgns_askadamid,createdon,wdrgns_question,wdrgns_reply,_wdrgns_ticket_value,_wdrgns_askadam_value";

  const filter = `_wdrgns_ticket_value eq ${ticketId}`;

  const orderby = "createdon asc";

  const askAdamUrl = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(
    filter
  )}&$select=${select}&$orderby=${orderby}`;

  try {
    const res = await axios.get(askAdamUrl, { headers });
    const records = res.data.value;

    interface AskAdamRecord {
      _wdrgns_askadam_value: string | null;
      createdon: string | null;
      wdrgns_question: string | null;
      wdrgns_reply: string | null;
      _wdrgns_ticket_value: string | null;
      wdrgns_askadamid: string | null;
    }

    const chats = records.map((e: AskAdamRecord) => ({
      AskAdamId: e._wdrgns_askadam_value || null,
      CreatedOn: e.createdon || null,
      Question: e.wdrgns_question || null,
      Answer: e.wdrgns_reply || null,
      TicketId: e._wdrgns_ticket_value || null,
      GUID: e.wdrgns_askadamid || null,
    }));

    // Sort by CreatedOn in ascending order && created date also can be null
    chats.sort((a, b) => {
      if (a.CreatedOn === null) return 1; // Nulls last
      if (b.CreatedOn === null) return -1; // Nulls last
      return new Date(a.CreatedOn).getTime() - new Date(b.CreatedOn).getTime();
    });

    return NextResponse.json(chats);
  } catch (err: any) {
    console.error(
      "Error fetching AskAdam chats:",
      err.response?.data?.error || err.message
    );
    return NextResponse.json(
      [],
      {
        status: 500, // Internal Server Error
      }
    );
  }
}

export async function POST(req, { params }) {
  const ticketId = params.id;
  const body = await req.json();
  const token = await getAccessToken();
  const lastCreatedOnStr = await getLastAskAdamRecordCreatedOn(ticketId, token);

  if (lastCreatedOnStr) {
    const lastCreatedOnDate = new Date(lastCreatedOnStr);
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    if (lastCreatedOnDate >= fiveMinutesAgo) {
      return NextResponse.json(
        {
          message: "A Question was asked within the last 5 minutes. Please wait before asking another question.",
        },
        {
          status: 429, // Too Many Requests
          headers: {
            "Retry-After": "300", // 5 minutes in seconds
          },
        }
      );
    }
    else {
      const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Accept: "application/json",
      };

      const firstAskAdamId = await getFirstAskAdamRecordId(ticketId, token);
      const createPayload = {
        wdrgns_question: body.questionText,
        "wdrgns_ticket@odata.bind": `/wdrgns_tickets(${ticketId})`,
      };

      if (firstAskAdamId) {
        createPayload[
          "wdrgns_askadam@odata.bind"
        ] = `/wdrgns_askadams(${firstAskAdamId})`;

      }
      try {
        const res = await axios.post(
          `${baseUrl}/wdrgns_askadams`,
          createPayload,
          { headers }
        );
        return NextResponse.json({
          message: "AskAdam record created successfully",
          id: res.data.wdrgns_askadamid,
        });
      } catch (error: any) {
        console.error(
          "Failed to create wdrgns_askadam record:",
          error.response?.data?.error || error.message
        );
      }
    }
  } else {
    const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      Accept: "application/json",
    };

    const createPayload = {
      wdrgns_question: body.questionText,
      "wdrgns_ticket@odata.bind": `/wdrgns_tickets(${ticketId})`,
    };

    try {
      const res = await axios.post(
        `${baseUrl}/wdrgns_askadams`,
        createPayload,
        { headers }
      );

      return NextResponse.json({
        message: "AskAdam record created successfully",
        id: res.data.wdrgns_askadamid,
      });
    } catch (error: any) {
      console.error(
        "Failed to create wdrgns_askadam record:",
        error.response?.data?.error || error.message
      );
    }
  }
}

async function getFirstAskAdamRecordId(ticketId, token) {
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const select = "wdrgns_askadamid";
  const filter = `_wdrgns_ticket_value eq ${ticketId}`;
  const orderby = "createdon asc";
  const top = 1;

  const url = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(
    filter
  )}&$select=${select}&$orderby=${orderby}&$top=${top}`;

  try {
    const res = await axios.get(url, { headers });
    const records = res.data.value;

    if (records.length > 0) {
      return records[0].wdrgns_askadamid;
    } else {
      return null;
    }
  } catch (err: any) {
    console.error(
      "Error fetching first AskAdam record:",
      err.response?.data?.error || err.message
    );
    return null;
  }
}

async function getLastAskAdamRecordCreatedOn(ticketId, token) {
  const baseUrl = `${process.env.RESOURCE}/api/data/v9.2`;
  const headers = { Authorization: `Bearer ${token}` };

  const select = "createdon";
  const filter = `_wdrgns_ticket_value eq ${ticketId}`;
  const orderby = "createdon desc";
  const top = 1;

  const url = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(
    filter
  )}&$select=${select}&$orderby=${orderby}&$top=${top}`;

  try {
    const res = await axios.get(url, { headers });
    const records = res.data.value;

    if (records.length > 0) {
      return records[0].createdon;
    } else {
      return null;
    }
  } catch (err) {
    console.error(
      "Error fetching last AskAdam record createdon:",
      err.response?.data?.error || err.message
    );
    return null;
  }
}
