"use client";

import { useTicketAndDisplayData } from "@/hooks/useFetch";
import axios from "axios";
import React from "react";
import AlertMessages from "@/UI/Alert";


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

  console.log(alertMessageList);
  return (
    <>

      <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
        {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
          <AlertMessages alertMessageList={alertMessageList || []} />
        )}

        <div
          className="flex justify-between items-start flex-1 w-full min-h-0"
          style={{
            minHeight: 0,
            backgroundImage: eventImage
              ? `linear-gradient(to top, rgba(0,0,0,1) 70%, rgba(0,0,0,0.2) 80%), url('${eventImage}')`
              : undefined,
            backgroundSize: "contain",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="shadow-2xl w-full p-4 md:p-12 lg:p-14">
            <div className="flex items-center mb-16 justify-around">
              {eventImage && (
                <img src={eventLogo} alt="Event Logo" className="w-16 h-16" />
              )}
              <div className="flex-1 text-center">
                <h1 className="text-base font-bold text-black">
                  {event?.name || null}
                </h1>
                <h1 className="text-base font-bold text-black">
                  {event?.secondLine || null}
                </h1>
                <h1 className="text-base font-bold text-black">
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
                <div className="font-bold text-[#da2127] text-[0.7rem]">
                  CONTACT
                </div>
                <div className="text-white font-bold text-sm">
                  {contact?.fullname || "-"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">
                  REMAINING SCANS
                </div>
                <div className="text-white font-bold text-sm">
                  {ticket?.remainingScans ?? "N/A"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">
                  VALID FROM
                </div>
                <div className="text-white font-bold text-sm">
                  {ticketType?.validFrom?.slice(0, 10) || "-"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">
                  VALID TO
                </div>
                <div className="text-white font-bold text-sm">
                  {ticketType?.validTo?.slice(0, 10) || "-"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">
                  LOCATION
                </div>
                <div className="text-white font-bold text-sm">
                  {location?.name || "-"}
                </div>
              </div>
              <div>
                <div className="font-bold text-[#da2127] text-[0.7rem]">
                  DESCRIPTION
                </div>
                <div className="text-white font-bold text-sm">
                  {event?.description || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}