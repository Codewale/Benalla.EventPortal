"use client";

import { useState } from "react";


export default function Footer({ }) {
    const [increament, setIncrement] = useState(1);
    function handleIncrement() {
        setIncrement((prev) => prev < 5 ? prev + 1 : 5);
    }
    function handleDecrement() {
        setIncrement((prev) => (prev > 1 ? prev - 1 : 1));
    }
    return (
        <>
            <div className="fixed bottom-0 left-0 w-full flex justify-between items-center px-8 py-4 z-50 rounded-t-2xl bg-black">
                <button
                    onClick={handleDecrement}
                    className="flex items-center justify-center bg-[#da2127] text-white rounded-[4px] w-14 h-8 shadow-md hover:bg-[#b81b22] transition"
                    aria-label="Previous"
                >
                    <svg width="32" height="24" fill="none" viewBox="0 0 32 24">
                        <line x1="26" y1="12" x2="6" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        <polyline points="14,5 6,12 14,19" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <p>{increament}/5</p>
                <button
                    onClick={handleIncrement}
                    className="flex items-center justify-center bg-[#da2127] text-white rounded-[4px] w-14 h-8 shadow-md hover:bg-[#b81b22] transition"
                    aria-label="Next"
                >
                    <svg width="32" height="24" fill="none" viewBox="0 0 32 24">
                        <line x1="6" y1="12" x2="26" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        <polyline points="18,5 26,12 18,19" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </>
    )
}