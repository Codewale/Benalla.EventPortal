'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import AlertMessages from "@/UI/Alert";

async function getTicket(id: string) {
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    return await axios.get(`${baseUrl}/api/tickets/${id}`);
}

async function getDisplayOrder(id: string) {
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    return await axios.get(`${baseUrl}/api/display/${id}`);
}

async function getChats(id: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
    return await axios.get(`${baseUrl}/api/ask-adam/${id}`);
}

async function postChatById(id: string, data: any) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
    return await axios.post(`${baseUrl}/api/ask-adam/${id}`, data);
}

export default function AskAdam({ params }) {
    const [ticketDetails, setTicketDetails] = useState(null);
    const [displayOrderDetails, setDisplayOrderDetails] = useState(null);
    const [alertMessageList, setAlertMessageList] = useState([]);
    const [ticketLinks, setTicketLinks] = useState([]);
    const [data, setData] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const ticketRes = await getTicket(params.id);
                const displayRes = await getDisplayOrder(params.id);
                setTicketDetails(ticketRes.data);
                setDisplayOrderDetails(displayRes.data);
                setAlertMessageList(ticketRes.data?.eventAlerts || []);
                setTicketLinks(displayRes.data?.ticketLinks || []);
                setError("");
            } catch (err) {
                setError("Error loading ticket.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [params.id]);

    async function getQues() {
        try {
            const resp = await getChats(params.id);
            if (resp) {
                setData(resp?.data);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getQues();
    }, [params.id]);

    const onChatSubmitHandler = async () => {
        try {
            await postChatById(params.id, {
                questionText: message,
            });
            setMessage("");
            await getQues();
        } catch (error) {
            console.error("Error submitting chat:", error);
            alert(
                error?.response?.data?.message ||
                "An error occurred while submitting your question."
            );
        }
    };

    if (loading) {
        return <div className="text-white text-center mt-10">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    const event = ticketDetails?.ticket?.event || {};
    const eventImage = event?.image ? `${event.image}` : "";
    const eventLogo = event?.logo ? `${event.logo}` : "";
    const promoterLogo = ticketDetails?.ticket?.promoter?.logo
        ? `${ticketDetails.ticket.promoter.logo}`
        : "";

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen bg-black relative top-0">
                {/* ✅ Alert Messages Section */}
                {Array.isArray(alertMessageList) && alertMessageList.length > 0 && (
                    <AlertMessages alertMessageList={alertMessageList || []} />
                )}

                <div
                    className="flex justify-between items-start flex-1 w-full min-h-0 pb-10"
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
                    <div className="shadow-2xl w-full md:p-12 lg:p-14 h-full flex flex-col min-h-[calc(100vh-170px)]">
                        <div className="flex items-center mb-16 justify-around">
                            {eventImage && (
                                <img
                                    src={eventLogo}
                                    alt="Event Logo"
                                    className="w-16 h-16"
                                />
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
                                    className="w-16 h-16"
                                />
                            )}
                        </div>

                        <div className="flex flex-col flex-1 min-h-0 w-full items-center justify-center h-full">
                            <div className="bg-white rounded-lg shadow-lg w-full md:w-[600px] flex flex-col flex-1 min-h-0 max-h-full p-0 h-full">
                                <div className="flex justify-between items-center border-b px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Ask Adam
                                    </h2>
                                </div>

                                <ul className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                                    {data && data.length > 0 && data.map((item) => (
                                        <div key={item.GUID} className="border px-4 py-2 my-4">
                                            <div className="flex justify-between items-center">
                                                <div>{item?.Question}</div>
                                                <div className=" text-sm text-gray-500">
                                                    {item?.CreatedOn
                                                        ? new Date(item.CreatedOn).toLocaleString()
                                                        : ""}
                                                </div>
                                            </div>
                                            <div className="w-full border my-2"></div>
                                            <div>
                                                <div className="text-gray-500 text-sm py-2 px-2">
                                                    {item?.Answer}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ul>

                                <div className="flex w-full bg-white py-4 px-6 rounded-b">
                                    <input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        type="text"
                                        placeholder="Type your message..."
                                        className="flex-1 border text-black border-gray-300 rounded-l px-4 py-2"
                                    />
                                    <button
                                        className="bg-slate-500 text-white px-6 py-2 rounded-r"
                                        onClick={onChatSubmitHandler}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
