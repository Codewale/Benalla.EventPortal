
export default function WhiteContainer({ children }) {
    return (
        <div className="bg-white rounded-xl shadow-md flex-1 flex justify-center items-center w-full min-h-[75px] p-4 mb-8">
            {children}
        </div >
    )
}
