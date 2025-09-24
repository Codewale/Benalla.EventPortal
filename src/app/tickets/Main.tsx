"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import Footer from "@/components/Common/Footer";
import { useTicketAndDisplayData } from "@/hooks/useFetch";

const pages = [
    { id: "info", component: dynamic(() => import("./FirstInfo")) },
    { id: "schedules", component: dynamic(() => import("./Schedules")) },
    { id: "promoter", component: dynamic(() => import("./PromoterNSponsors")) },
    { id: "links", component: dynamic(() => import("./TicketLinksnOpenings")) },
    { id: "askAdam", component: dynamic(() => import("./AskAdam")) },
    { id: "maps", component: dynamic(() => import("./Maps")) },
    { id: "bookings", component: dynamic(() => import("./Booking")) },
    { id: "vehicle", component: dynamic(() => import("./Vehicle")) },
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

    const footerProps = {
        navigationPageNo: pageIndex + 1,
        handleIncrement,
        handleDecrement,
        totalPages: pages.length,
    };
    const ifLoading = useTicketAndDisplayData(params.id)

    return (
        <>
            <PageComponent params={params} />
            {!ifLoading.isTicketLoading && <Footer {...footerProps} />}
        </>
    );
}
