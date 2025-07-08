import axios from "axios";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";

export async function getTicket(id) {
    // Use relative path since API and UI are on the same origin in Next.js
    const res = await axios.get(`${baseUrl}/api/tickets/${id}`);
    return res.data;
}

// Helper to fetch display order for table from API 
export async function getDisplayOrder(id) {
    // Use relative path since API and UI are on the same origin in Next.js
    const res = await axios.get(`${baseUrl}/api/display/${id}`);
    return res.data;
}


export function useTicketAndDisplayData(id) {

    const { data: ticketDetails, isLoading: isTicketLoading, error: ticketError } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => getTicket(id),
        enabled: !!(id)
    })

    const {
        data: displayOrderDetails,
        isLoading: isDisplayLoading,
        error: displayError,
    } = useQuery({
        queryKey: ['display', id],
        queryFn: () => getDisplayOrder(id),
        enabled: !!(id)
    })

    return { ticketDetails, displayOrderDetails, isTicketLoading, isDisplayLoading, ticketError, displayError };
}
