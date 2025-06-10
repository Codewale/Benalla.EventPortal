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

const DUMMY_DATA = [
  {
    id: 1,
    question: "What is your name?",
    answer: "My name is Adam, your virtual assistant."
  },
  {
    id: 2,
    question: "How can I reset my password?",
    answer: "You can reset your password by clicking on 'Forgot Password' on the login page."
  },
  {
    id: 3,
    question: "What are your support hours?",
    answer: "Our support team is available from 9 AM to 6 PM, Monday through Friday."
  },
  // {
  //   id: 4,
  //   question: "Where can I find my invoices?",
  //   answer: "You can find your invoices under the 'Billing' section in your account settings."
  // },
  // {
  //   id: 5,
  //   question: "Can I upgrade my subscription plan?",
  //   answer: "Yes, you can upgrade your subscription plan from the 'Plans & Pricing' page."
  // }
];



function getTodayFormatted() {
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });

  function getOrdinalSuffix(n) {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  return `${day}${getOrdinalSuffix(day)}, ${month}`;
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


    const date = getTodayFormatted();

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
        <div className="fixed inset-0  bg-black bg-opacity-40 flex items-center justify-center z-50">
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

            <ul className="h-40 overflow-y-auto">
              {DUMMY_DATA.map(data => (<>
                <li key={data.id} className="my-2 flex flex-col mt-4 space-y-4 bg-slate-300 h-auto rounded-xl">                 
                  <div className="flex justify-between items-center border-b-2 ">
                    <p className="mt-1 block w-fit p-4 rounded-md text-black border-gray-300">
                      {data.question}
                    </p>
                    <p className="px-2 text-black">   
                      {date}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="mt-1 block w-fit p-4 rounded-md text-black border-gray-300 shadow-sm bg-slate-300">
                      {data.answer}
                    </p>
                    <p className="px-2 self-end text-black">
                      {date}
                    </p>
                  </div>
                </li>
              </>))}     
            </ul>

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
