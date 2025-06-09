'use client';

import React, { useState } from 'react';

import { CiChat1 } from "react-icons/ci";


export default function ChatModal() {
    const [modalOpen, setModalOpen] = useState(false);

    const handleToggleModal = () => {
        setModalOpen(prevState => !prevState)
    }



  return (
    <>
     <div className="fixed bottom-5 right-5 z-50">
          <div 
          onClick={handleToggleModal}
          className="bg-white rounded-full shadow-2xl p-4 w-16 h-16 flex items-center justify-center cursor-pointer">
          <CiChat1 className="text-black w-8 h-8" />
        </div>
      </div>

    
    {modalOpen &&
         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="border-b pb-3">
                    <h2 className="text-lg font-semibold text-gray-800">Heading for Chat portion</h2>
                </div>

                <div className="flex flex-col mt-4 space-y-4">
                  <div className='flex justify-end'>
                    <textarea
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-red-200" 
                      placeholder=""
                    />
                  </div>

                  <div className='flex justify-start'>
                    <textarea
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-300"
                      placeholder=""
                    />
                  </div>
                </div>


               <div 
                  onClick={handleToggleModal}
                  className="bg-gray-300 text-black m-4 px-6 py-2 rounded-md shadow cursor-pointer w-fit"
                >
                  Close
                </div>

            </div>
          </div>
    }
    </>
  );
}

