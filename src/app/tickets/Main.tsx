"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import Footer from "@/components/Common/Footer";
import { useTicketAndDisplayData } from "@/hooks/useFetch";


const pages = [
    { id: "info", component: dynamic(() => import("./FirstInfo")), pageTitle: 'Entry Scan' },
    { id: "schedules", component: dynamic(() => import("./Schedules")), pageTitle: 'Schedule' },
    { id: "promoter", component: dynamic(() => import("./PromoterNSponsors")), pageTitle: 'With thanks to' },
    { id: "links", component: dynamic(() => import("./TicketLinksnOpenings")), pageTitle: 'Information' },
    { id: "askAdam", component: dynamic(() => import("./AskAdam")), pageTitle: 'Ask Adam' },
    { id: "maps", component: dynamic(() => import("./Maps")), pageTitle: 'Site maps' },
    { id: "bookings", component: dynamic(() => import("./Booking")), pageTitle: 'Bookings' },
    { id: "vehicle", component: dynamic(() => import("./Vehicle")), pageTitle: 'Vehicle details' },
];

export default function Main({ params }) {

    const [pageIndex, setPageIndex] = useState(0);

    const PageComponent = pages[pageIndex].component;

    function handleIncrement() {
        setPageIndex((prev) => (prev + 1 <= pages.length - 1 ? prev + 1 : prev));
    }
    function handleDecrement() {
        setPageIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    }

    const ifLoading = useTicketAndDisplayData(params.id);

    if (!ifLoading.isTicketLoading) {
        if (ifLoading?.ticketDetails?.bookings.length == 0 && pages[6].id == "bookings") {
            pages.splice(6, 1);
        }
        if (ifLoading?.ticketDetails?.vehicle.length == 0 && (pages[7]?.id == "vehicle" || pages[6]?.id == "vehicle")) {
            pages.splice(7, 1);
        }

    }
    console.log(...pages);


    const footerProps = {
        navigationPageNo: pageIndex + 1,
        handleIncrement,
        handleDecrement,
        totalPages: pages.length,
        pageTitle: pages[pageIndex].pageTitle
    };
    return (
        <>
            <PageComponent params={params} />
            {!ifLoading.isTicketLoading && <Footer {...footerProps} />}
        </>
    );
}
