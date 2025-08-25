'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import AlertMessages from "@/components/common/Alert";
import { useTicketAndDisplayData } from "@/hooks/useFetch";
import Background from "@/components/common/Background";
import EventTitle from "@/components/common/EventTitle";
import WhiteContainer from "@/components/common/WhiteContainer";
import SectionHeader from "@/components/common/SectionHeader";
import { archivoBlack, spaceGrotesk } from '@/fonts/fonts'

async function getTicket(id) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    return await axios.get(`${baseUrl}/api/tickets/${id}`);
}

async function getDisplayOrder(id) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    return await axios.get(`${baseUrl}/api/display/${id}`);
}

async function getChats(id) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
    return await axios.get(`${baseUrl}/api/ask-adam/${id}`);
}

async function postChatById(id, data) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    return await axios.post(`${baseUrl}/api/ask-adam/${id}`, data);
}

export default function AskAdam({ params }) {
    const [message, setMessage] = useState("");

    const {
        chatsData,
        displayError,
        displayOrderDetails,
        getChatError,
        isChatLoading,
        isDisplayLoading,
        isPostChatsPending,
        isTicketLoading,
        postChatError,
        postChatsData,
        ticketDetails,
        ticketError,
    } = useTicketAndDisplayData(params.id);

    const chatMessages = chatsData || [];
    const alertMessageList = ticketDetails?.eventAlerts || [];



    const onChatSubmitHandler = async () => {
        try {
            await postChatsData({
                id: params.id,
                data: {
                    questionText: message,
                },
            });
            setMessage("");
        } catch (error) {
            console.error("Error submitting chat:", error);
            alert(
                error?.response?.data?.message ||
                "An error occurred while submitting your question."
            );
        }
    };

    if (isChatLoading || isTicketLoading || isPostChatsPending) {
        return <div className="text-white text-center mt-10">Loading...</div>;
    }

    if (ticketError || postChatError || getChatError) {
        return (
            <div className="text-center mt-10 text-red-500">
                {ticketError?.message ||
                    postChatError?.message ||
                    getChatError?.message ||
                    "An error occurred."}
            </div>
        );
    }

    const event = ticketDetails?.event || {};
    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = ticketDetails?.ticket?.promoter?.logo
        ? `${ticketDetails.ticket.promoter.logo}`
        : "";
    console.log(ticketDetails.ti);


    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen bg-transparent relative top-0">
                {/* Alert Messages Section */}
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />
                )}

                <Background eventImage={eventImage}>
                    <div className="shadow-2xl w-full p-4">
                        <div className="md:px-12 md:pt-12 pb-0" >
                            <EventTitle params={params} />
                        </div>

                        <div className="w-full flex flex-col items-center">
                            <SectionHeader param="Ask Adam" />


                            <WhiteContainer>
                                <div className="flex flex-col flex-1 min-h-0 w-full items-center justify-center h-full p-4">
                                    {/* <div className="bg-white shadow-lg w-full md:w-[600px] flex flex-col flex-1 min-h-0 max-h-full h-full"> */}
                                    <div className="w-full md:w-[600px] flex flex-col flex-1 min-h-0 max-h-full h-full">
                                        <ul className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                                            {chatMessages.lenght === 0 ? (
                                                <p className="text-center text-blue-700">
                                                    No chats yet. Start the conversion!
                                                </p>
                                            ) : (
                                                chatMessages.map((item) => (
                                                    <div key={item.GUID} className="border px-4 py-2 my-4">
                                                        <div className={`flex justify-between items-center text-black ${archivoBlack.className}`}>
                                                            <div>{item?.Question}</div>
                                                            <div className={`text-sm text-black ${archivoBlack.className}`}>
                                                                {item?.CreatedOn
                                                                    ? new Date(item.CreatedOn).toLocaleString()
                                                                    : ""}
                                                            </div>
                                                        </div>
                                                        <div className="w-full border my-2"></div>
                                                        <div>
                                                            <div className={`text-black text-sm py-2 px-2 ${spaceGrotesk.className}`}>
                                                                {item?.Answer}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </ul>

                                        <div className="flex justify-center w-full bg-white py-4 px-6 rounded-b">
                                            <input
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                type="text"
                                                placeholder="Type your message..."
                                                className={`flex-1 border text-black border-gray-300 rounded-l px-4 py-2 ${spaceGrotesk.className}`}
                                            />
                                            <button
                                                className={`bg-slate-500 text-white px-6 py-2 rounded-r ${spaceGrotesk.className}`}
                                                onClick={onChatSubmitHandler}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </WhiteContainer>
                        </div>



                    </div>
                </Background>
            </div>
        </>
    );
}
