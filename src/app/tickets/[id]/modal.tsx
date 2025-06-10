"use client";

import React, { useEffect, useState } from "react";
import { CiChat1 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import axios from "axios";

async function getChats(id: string) {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
  // Use relative path since API and UI are on the same origin in Next.js
  return await axios.get(`${baseUrl}/api/ask-adam/${id}`);
}

export default function ChatModal({ params }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleToggleModal = () => {
    setModalOpen((prevState) => !prevState);
  };

  useEffect(() => {
    async function getQues() {
      try {
        const resp = await getChats(params.id);
      } catch (error) {
        console.error(error);
      }
    }
    getQues();
  }, []);

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        {!modalOpen && (
          <div
            onClick={handleToggleModal}
            className="bg-white rounded-full shadow-2xl p-4 w-16 h-16 flex items-center justify-center cursor-pointer"
          >
            <CiChat1 className="text-black w-8 h-8" />
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Heading for Chat
              </h2>
              <div
                onClick={handleToggleModal}
                className="bg-slate-500 rounded-full p-2 flex items-center justify-center cursor-pointer"
              >
                <IoMdClose size={16} />
              </div>
            </div>

            <div className="flex flex-col mt-4 space-y-4">
              <div className="flex justify-start">
                <p className="mt-1 block w-2/3 p-4 rounded-md border-gray-300 shadow-sm bg-slate-300">
                  text 1
                </p>
              </div>

              <div className="flex justify-end">
                <p className="mt-1 block w-2/3 p-4 rounded-md border-gray-300 shadow-sm bg-slate-500">
                  text 2
                </p>
              </div>
            </div>

            <div className="flex w-full max-w-md bg-white p-4 rounded">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border text-black border-gray-300 rounded-l px-4 py-2"
              />
              <button className="bg-slate-500 text-white px-6 py-2 rounded-r">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
