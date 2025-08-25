
import { useTicketAndDisplayData } from "@/Hooks/useFetch";
import { spaceGrotesk, archivoBlack } from '@/Fonts/fonts'


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
                <h1 className={`text-sm font-bold text-white ${archivoBlack.className} text-[1.11rem]`} >
                    {event?.firstLine || null}
                </h1>
                <h1 className={`text-sm font-bold text-white ${archivoBlack.className} text-[1.11rem]`}>
                    {event?.secondLine || null}
                </h1>
                <h1 className={`text-sm font-bold text-white ${archivoBlack.className} text-[1.11rem]`}>
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
    )
}