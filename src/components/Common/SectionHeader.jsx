
import { spaceGrotesk, archivoBlack } from '@/Fonts/fonts'


export default function SectionHeader({ param }) {
    return (
        <div className="flex justify-center items-center w-full mb-2">
            <div className="bg-[#E53935] rounded-[0.6rem] w-full py-[0.4rem] flex justify-center items-center">
                <span className={`text-white text-xs font-bold uppercase tracking-wider ${archivoBlack.className}`}>
                    {param}
                </span>
            </div>
        </div>
    )
}
