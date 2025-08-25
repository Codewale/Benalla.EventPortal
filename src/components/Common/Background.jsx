
import { Children } from "react";
import { spaceGrotesk, archivoBlack } from '@/Fonts/fonts'


export default function Background({ children, eventImage }) {
    return (
        <div
            className="flex justify-between items-start flex-1 w-full min-h-0 mb-[4rem]"
            style={{
                maxWidth: 690,
                position: "relative",
                left: "50%",
                transform: "translate(-50%, 0)",
                minHeight: 0,
                backgroundImage: eventImage
                    ? `linear-gradient(180deg, RGBA(0,0,0,0.1) 10%, RGBA(0,0,0,1) 20%),url('${eventImage}')`
                    : undefined,
                backgroundSize: eventImage ? '100% 100vh, contain' : undefined, // gradient height 150px
                backgroundRepeat: 'no-repeat, no-repeat',
                backgroundPosition: 'top center, top center',
            }}
        >
            {children}
        </div>
    )
}