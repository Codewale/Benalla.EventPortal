import axios from "axios";
import React from "react";
import FirstInfo from "../../../components/FirstInfo";
import Footer from "../../../components/Footer";
import Schedules from "../../../components/Schedules";
import PromoterNsponsors from "../../../components/PromoterNSponsors";
import TicketLinksnOpenings from "../../../components/TicketLinksnOpenings";
import Maps from "../../../components/Maps";
async function getTicket(id: string) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  return await axios.get(`${baseUrl}/api/tickets/${id}`);
}

export default async function TicketPage({ params }) {
  let ticketDetails;
  try {
    ticketDetails = await getTicket(params.id);
  } catch (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading ticket.
      </div>
    );
  }

  return (
    <>
      <FirstInfo params={params} />
      <Footer />
    </>

  );
}