"use client";

import { useTicketAndDisplayData } from "@/hooks/useFetch";
import axios from "axios";
import React from "react";
import AlertMessages from "@/UI/Alert";
import { Space_Grotesk, Archivo_Black } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
});

export default function FirstInfo({ params }) {

  const { ticketDetails, isTicketLoading, ticketError } =
    useTicketAndDisplayData(params.id);

  if (isTicketLoading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (ticketError) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error loading ticket.
      </div>
    );
  }

  const ticket = ticketDetails.ticket;
  const ticketType = ticketDetails.ticketType;
  const contact = ticketDetails.contact;
  const event = ticketDetails.event;
  const promoter = ticketDetails.promoter;
  const location = ticketDetails.location;
  const sponsors = ticketDetails.sponsors;
  const primarySponsors = ticketDetails.primarySponsors;
  const qrCode = ticketDetails.qrCode;
  const eventSchedules = ticketDetails.eventSchedules;
  const alertMessageList = ticketDetails.eventAlerts;

  const eventImage = event?.image ? `${event.image}` : "";
  const eventLogo = event?.logo ? `${event.logo}` : "";
  const promoterLogo = promoter?.logo ? `${promoter.logo}` : "";
  const locationMap = event?.map ? `${event.map}` : "";
  const qr = qrCode ? `${qrCode}` : "";

  return (
    <>

      <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
        {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
          <AlertMessages alertMessageList={alertMessageList || []} />
        )}

        <div
          className="flex justify-between items-start flex-1 w-full min-h-0 mb-[4rem]"
          style={{
            maxWidth: 690,
            position: "relative",
            left: "50%",
            transform: "translate(-50%, 0)",
            minHeight: 0,
            backgroundImage: eventImage
              ? `linear-gradient(180deg, RGBA(0,0,0,0.1) 10%, RGBA(0,0,0,1) 20%),url('${eventImage}')`
              : undefined,
            backgroundSize: eventImage ? '100% 100vh, contain' : undefined, // gradient height 150px
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundPosition: 'top center, top center',
          }}
        >
          <div className="shadow-2xl w-full p-4 md:p-12 lg:p-14">
            <div className="flex items-center mb-16 justify-around">
              {eventImage && (
                <img src={eventLogo} alt="Event Logo" className="w-16 h-16" />
              )}
              <div className="flex-1 text-center">
                <h1 className={`text-sm font-bold text-white ${archivoBlack.className}`}>
                  {event?.firstLine || null}
                </h1>
                <h1 className={`text-sm font-bold text-white ${archivoBlack.className}`}>
                  {event?.secondLine || null}
                </h1>
                <h1 className={`text-sm font-bold text-white ${archivoBlack.className}`}>
                  {event?.thirdLine || null}
                </h1>
              </div>
              {promoterLogo && (
                <img
                  src={promoterLogo}
                  alt="Promoter Logo"
                  className="w-16 h-16 "
                />
              )}
            </div>


            {qr && (
              <div className="flex justify-center items-center m-4">
                <img
                  src={qr}
                  alt="QR CODE"
                  className="w-[250px] h-[250px] object-cover rounded-3xl mb-6"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  CONTACT
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  {contact?.fullname || "-"}
                </div>
              </div>
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  REMAINING SCANS
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  {ticket?.remainingScans ?? "N/A"}
                </div>
              </div>
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  VALID FROM
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  {ticketType?.validFrom?.slice(0, 10) || "-"}
                </div>
              </div>
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  VALID TO
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  {ticketType?.validTo?.slice(0, 10) || "-"}
                </div>
              </div>
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  LOCATION
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  <a className={`text-white font-bold text-sm no-underline ${spaceGrotesk.className}`} href={`https://www.bing.com/maps?cp=${location.suburbCoordinates.latitude}%7E${location.suburbCoordinates.longitude}&lvl=15`} target="_blank">{location?.name || "-"}</a>
                </div>
              </div>
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  DESCRIPTION
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  {event?.description || "-"}
                </div>
              </div>
              <div>
                <div className={`font-bold text-[#da2127] text-[0.7rem] ${archivoBlack.className}`}>
                  ADDRESS LINE
                </div>
                <div className={`text-white font-bold text-sm ${spaceGrotesk.className}`}>
                  {location?.addressLine1 || location?.addressLine2 || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}