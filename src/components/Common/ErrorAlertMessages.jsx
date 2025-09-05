export default function ErrorAlertMessages({ message, closeErrorsMessageFunc }) {
    return (
        <div className="fixed left-1/2 -translate-x-1/2 z-50 bg-white text-red-600 rounded-[10px] shadow-lg px-4 py-3 max-w-lg w-[calc(100%-2rem)] border" style={{ top: '7%', zIndex: 999 }}>
            <button onClick={closeErrorsMessageFunc} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg">×</button>
            {message}
        </div>
    );
}
