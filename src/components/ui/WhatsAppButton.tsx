export default function WhatsAppButton(){
    return(
        <a
              href="https://wa.me/554733390678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border rounded-full bg-green-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-green-500 hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20"
            >
              <img
                src="/whatsapp.png"
                alt=""
                className="h-5 w-5 brightness-0 invert" 
              />
              FALE AGORA
            </a>
    )
}