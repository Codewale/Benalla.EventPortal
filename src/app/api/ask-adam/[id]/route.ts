import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { getAccessToken, getApiConfig, createAuthHeaders } from "../../shared/auth";

interface AskAdamRecord {
  _wdrgns_askadam_value: string | null;
  createdon: string | null;
  wdrgns_question: string | null;
  wdrgns_reply: string | null;
  _wdrgns_ticket_value: string | null;
  wdrgns_askadamid: string | null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const token = await getAccessToken();
    const { baseUrl } = getApiConfig();
    const headers = createAuthHeaders(token);

    const select = "wdrgns_askadamid,createdon,wdrgns_question,wdrgns_reply,_wdrgns_ticket_value,_wdrgns_askadam_value";
    const filter = `_wdrgns_ticket_value eq ${ticketId}`;
    const orderby = "createdon asc";

    const askAdamUrl = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=${orderby}`;

    const response = await axios.get(askAdamUrl, { headers });
    const records = response.data.value;

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
  } catch (error) {
    console.error("Error fetching AskAdam chats:", error);
    return NextResponse.json([], { status: 500 });
  }
}

async function getLastAskAdamRecordCreatedOn(ticketId: string, token: string): Promise<string | null> {
  const { baseUrl } = getApiConfig();
  const headers = createAuthHeaders(token);

  const select = "createdon";
  const filter = `_wdrgns_ticket_value eq ${ticketId}`;
  const orderby = "createdon desc";
  const top = 1;

  const url = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=${orderby}&$top=${top}`;

  try {
    const response = await axios.get(url, { headers });
    const records = response.data.value;

    if (records.length > 0) {
      return records[0].createdon;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching last AskAdam record createdon:", error);
    return null;
  }
}

async function getFirstAskAdamRecordId(ticketId: string, token: string): Promise<string | null> {
  const { baseUrl } = getApiConfig();
  const headers = createAuthHeaders(token);

  const select = "wdrgns_askadamid";
  const filter = `_wdrgns_ticket_value eq ${ticketId}`;
  const orderby = "createdon asc";
  const top = 1;

  const url = `${baseUrl}/wdrgns_askadams?$filter=${encodeURIComponent(filter)}&$select=${select}&$orderby=${orderby}&$top=${top}`;

  try {
    const response = await axios.get(url, { headers });
    const records = response.data.value;

    if (records.length > 0) {
      return records[0].wdrgns_askadamid;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching first AskAdam record:", error);
    return null;
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const body = await req.json();
    const token = await getAccessToken();
    const { baseUrl } = getApiConfig();
    
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
    }

    // Create AskAdam record
    const headers = {
      ...createAuthHeaders(token),
      "Content-Type": "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      Accept: "application/json",
    };

    const firstAskAdamId = await getFirstAskAdamRecordId(ticketId, token);
    
    const createPayload: Record<string, string> = {
      wdrgns_question: body.questionText,
      "wdrgns_ticket@odata.bind": `/wdrgns_tickets(${ticketId})`,
    };

    if (firstAskAdamId) {
      createPayload["wdrgns_askadam@odata.bind"] = `/wdrgns_askadams(${firstAskAdamId})`;
      console.log(`Existing AskAdam record found: ${firstAskAdamId}, setting as lookup`);
    } else {
      console.log("No existing AskAdam records found — creating first question without lookup");
    }

    const response = await axios.post(`${baseUrl}/wdrgns_askadams`, createPayload, { headers });
    
    console.log("wdrgns_askadam record created successfully.");
    console.log("Created record location:", response.headers["odata-entityid"] || response.headers["location"]);
    
    return NextResponse.json({
      message: "AskAdam record created successfully",
      id: response.data.wdrgns_askadamid,
    });
  } catch (error) {
    console.error("Failed to create wdrgns_askadam record:", error);
    return NextResponse.json(
      { error: "Failed to create AskAdam record" },
      { status: 500 }
    );
  }
}
