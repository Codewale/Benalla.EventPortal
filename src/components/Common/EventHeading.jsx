export default function EventHeading({ children, archivoBlack }) {
  return (
    <h1 className={archivoBlack.className}>
      {children}
    </h1>
  );
}