"use client";

import React, { useEffect, useState } from "react";
import { CiChat1 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

async function getChats(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
  // Use relative path since API and UI are on the same origin in Next.js
  return await axios.get(`${baseUrl}/api/ask-adam/${id}`);
}

async function postChatById(id: string, data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
  return await axios.post(`${baseUrl}/api/ask-adam/${id}`, data);
}

export default function ChatModal({ params }) {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");

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
  }, []);

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

  return (
    <>
      {/* <div className="fixed bottom-16 right-5 z-50">
        {!modalOpen && (
          <div
            onClick={handleToggleModal}
            className="bg-white rounded-full shadow-2xl p-4 w-16 h-16 flex items-center justify-center cursor-pointer"
          >
            <CiChat1 className="text-black w-8 h-8" />
          </div>
        )}
      </div> */}



      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full md:w-[600px] p-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Heading for Chat
            </h2>
            {/* <div
                onClick={handleToggleModal}
                className="bg-slate-500 rounded-full p-2 flex items-center justify-center cursor-pointer"
              >
                <IoMdClose size={16} className="text-white" />
              </div> */}
          </div>

          <ul className="h-[300px] overflow-y-auto">
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

          <div className="flex w-full bg-white py-4 rounded">
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

    </>
  );
}
