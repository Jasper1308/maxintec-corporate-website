type WhatsAppButtonProps = {
  className?: string;
};

export default function WhatsAppButton({ className = "" }: WhatsAppButtonProps) {
  return (
    <a
      href="https://wa.me/554733390678"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale agora com a Maxintec pelo WhatsApp"
      className={`inline-flex items-center justify-center gap-2 border rounded-full px-8 py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${className}`}
    >
      <img
        src="/whatsapp.png"
        alt=""
        aria-hidden="true"
        className="h-5 w-5"
      />
      FALE AGORA
    </a>
  );
}