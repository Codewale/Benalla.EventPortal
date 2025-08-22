import { archivoBlack, spaceGrotesk } from '@/Fonts/fonts'

export default function InfoBlock({ heading, value, color = "#da2127" }) {
  return (
    <div>
        <h2 className={`text-[${color}] ${archivoBlack.className}`}>
            {heading}
        </h2>
        <div className={`body1 ${spaceGrotesk.className}`}>
            {value}
        </div>
    </div>
  );
}