type WhatsAppButtonSize = "md" | "lg";

type WhatsAppButtonProps = {
  className?: string;
  size?: WhatsAppButtonSize;
  dataCtaLocation?: string;
};

export default function WhatsAppButton({
  className = "",
  size = "md",
  dataCtaLocation,
}: WhatsAppButtonProps) {
  const paddingClasses =
    size === "lg" ? "px-10 py-3.5 text-base" : "px-8 py-3.5 text-sm";
  const iconClasses = size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <a
      href="https://wa.me/554733390678"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale agora com a Maxintec pelo WhatsApp"
      data-cta-location={dataCtaLocation}
      className={`inline-flex items-center justify-center gap-2 border rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${paddingClasses} ${className}`}
    >
      <img
        src="/whatsapp.png"
        alt=""
        aria-hidden="true"
        className={iconClasses}
      />
      FALE AGORA
    </a>
  );
}