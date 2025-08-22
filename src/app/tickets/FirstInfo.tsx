// "use client";

import { useTicketAndDisplayData } from "@/Hooks/useFetch";
import axios from "axios";
import React from "react";
import AlertMessages from "@/Components/Common/Alert";
import Background from "@/Components/Common/Background";
import EventTitle from "@/Components/Common/EventTitle";
import Loader from "@/Components/Common/Loader";
import { archivoBlack, spaceGrotesk } from '@/Fonts/fonts'
import InfoBlock from '@/Components/Common/InfoBlock';

export default function FirstInfo({ params }) {

  const { ticketDetails, isTicketLoading, ticketError } =
    useTicketAndDisplayData(params.id);

  if (isTicketLoading) {
    return <Loader />;
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
  const location = ticketDetails.location;
  const qrCode = ticketDetails.qrCode;
  const alertMessageList = ticketDetails.eventAlerts;

  const eventImage = event?.image ? `${event.image}` : "";
  const qr = qrCode ? `${qrCode}` : "";

  return (
    <>

      <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
        {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
          <AlertMessages alertMessageList={alertMessageList || []} />
        )}

        <Background eventImage={eventImage}>

          <div className="shadow-2xl w-full p-4 md:p-12 lg:p-14">
            <EventTitle params={params} />


            {qr && (
              <div className="flex justify-center items-center m-4">
                <img
                  src={qr}
                  alt="QR CODE"
                  className="w-[400px] h-[400px] object-cover rounded-3xl mb-6"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <InfoBlock heading={'CONTACT'} value={contact?.fullname || "-"} />
              <InfoBlock heading={'REMAINING SCANS'} value={ticket?.remainingScans ?? "N/A"} />
              <InfoBlock heading={'VALID FROM'} value={ticketType?.validFrom?.slice(0, 10) || "-"} />
              <InfoBlock heading={'VALID TO'} value={ticketType?.validTo?.slice(0, 10) || "-"} />
              <InfoBlock heading={'LOCATION'} value={<a className={`body1 underline ${spaceGrotesk.className}`} href={`https://www.bing.com/maps?cp=${location.suburbCoordinates.latitude}%7E${location.suburbCoordinates.longitude}&lvl=15`} target="_blank">{location?.name || "-"}</a>} />
              <InfoBlock heading={'DESCRIPTION'} value={event?.description || "-"} />
              <InfoBlock heading={'ADDRESS LINE'} value={location?.addressLine1 || location?.addressLine2 || "-"} />
            </div>
          </div>
        </Background>
      </div >
    </>
  );
}