
import { useTicketAndDisplayData } from "@/Hooks/useFetch";
import { spaceGrotesk, archivoBlack } from '@/Fonts/fonts'
import EventHeading from './EventHeading';

export default function EventTitle({ params }) {

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


    const event = ticketDetails.event;
    const promoter = ticketDetails.promoter;
    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = promoter?.logo ? `${promoter.logo}` : "";

    return (
        <div className="flex items-center mb-16 justify-around ">
            {eventImage && (
                <img src={eventLogo} alt="Event Logo" className="w-16 h-16" />
            )}
            <div className="flex-1 text-center">
                <EventHeading archivoBlack={archivoBlack}>{event?.firstLine || null}</EventHeading>
                <EventHeading archivoBlack={archivoBlack}>{event?.secondLine || null}</EventHeading>
                <EventHeading archivoBlack={archivoBlack}>{event?.thirdLine || null}</EventHeading>
            </div>
            {promoterLogo && (
                <img
                    src={promoterLogo}
                    alt="Promoter Logo"
                    className="w-16 h-16 "
                />
            )}
        </div>
    )
}