"use client";

import { useEffect } from "react";

export default function WhatsAppFloatButton() {
  const phone = "554733390678";
  const message = "Olá! Vim pelo site e quero saber mais.";

  const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50"
    >
      <div className="animate-shake bg-green-500 hover:bg-green-600 text-black p-4 rounded-full shadow-lg transition-all duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="currentColor"
        > 
          <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.5 2.1 7.9L.3 31.7l8-2.1c2.3 1.3 4.9 2 7.7 2 8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4zm0 28.5c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.3-2.1-2-4.5-2-6.9C3.1 8.8 8.8 3.1 16 3.1S28.9 8.8 28.9 16 23.2 28.9 16 28.9zm7.2-9.8c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.6-.2-.9.2s-1 1.3-1.2 1.6c-.2.3-.5.3-.9.1-2.6-1.3-4.3-2.3-6-5.2-.5-.9.5-.8 1.4-2.6.1-.3.1-.6 0-.8s-.9-2.2-1.2-3c-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.8.1-1.2.6s-1.6 1.5-1.6 3.6 1.7 4.2 2 4.5c.2.3 3.3 5 8 7 .9.4 1.6.6 2.2.8.9.3 1.8.3 2.5.2.8-.1 2.4-1 2.8-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes shake {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }

        .animate-shake {
          animation: shake 1.5s infinite;
        }
      `}</style>
    </a>
  );
}