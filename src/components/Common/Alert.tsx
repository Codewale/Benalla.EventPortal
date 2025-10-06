import React from "react";
import { archivoBlack } from '@/fonts/fonts'

interface AlertItem {
    id: string;
    alertText?: string;
    alertColour?: string;
    alertImageBase64?: string;
}

interface AlertMessagesProps {
    alertMessageList: AlertItem[];
}

const AlertMessages: React.FC<AlertMessagesProps> = ({ alertMessageList }) => {
    if (!Array.isArray(alertMessageList) || alertMessageList.length === 0) {
        return null;
    }

    return (
        <div
            style={{ position: "sticky", top: 0, left: 0, width: "100%", zIndex: 50 }}
            className="flex flex-col gap-1"
        >
            {alertMessageList.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-1"
                    style={{
                        backgroundColor: item.alertColour || "#fef3c7",
                    }}
                >
                    {item.alertImageBase64 ? (
                        <img
                            src={item.alertImageBase64}
                            alt="Alert"
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                            !
                        </div>
                    )}

                    <p className={`text-xs text-white italic font-thin ${archivoBlack.className}`}>
                        {item.alertText || "No alert message provided."}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default AlertMessages;

