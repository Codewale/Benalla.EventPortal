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
    <div className='absolute bottom-0 right-0'>
        <button onClick={handleToggleModal}>
            <CiChat1 />
        </button>
    </div>
    
    {modalOpen &&
         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
             {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">Heading for Chat portion</h2>
            </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="text 1...."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Message</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="text 2..."
            />
          </div>
        </div>
      </div>
    </div>
    }
    </>
  );
}

