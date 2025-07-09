import axios from "axios";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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


// async function getTicket(id: string) {
//     const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
//     return await axios.get(`${baseUrl}/api/tickets/${id}`);
// }

// async function getDisplayOrder(id: string) {
//     const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
//     return await axios.get(`${baseUrl}/api/display/${id}`);
// }


//Helper to fetch chats for table 
async function getChats(id) {
    // const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
    const res = await axios.get(`${baseUrl}/api/ask-adam/${id}`);
    return res.data;
}


// Helper to send chat by id
async function postChatById(id, data) {
    // const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    return await axios.post(`${baseUrl}/api/ask-adam/${id}`, data);
}





export function useTicketAndDisplayData(id) {
    const queryClient = useQueryClient();

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


    const { data: chatsData, isLoading: isChatLoading, error: getChatError } = useQuery({
        queryKey: ['chats', id],
        queryFn: () => getChats(id),
        enabled: !!(id),
    })

    const { mutateAsync: postChatsData, isLoading: isPostChatsPending, error: postChatError } = useMutation({
        mutationFn: ({ id, data }) => postChatById(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['chats', id]
            })
        }

    })

    return { ticketDetails, displayOrderDetails, chatsData, postChatsData, isTicketLoading, isDisplayLoading, isChatLoading, isPostChatsPending, ticketError, displayError, getChatError, postChatError };
}

