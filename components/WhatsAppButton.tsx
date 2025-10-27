import React from 'react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

const WhatsAppButton: React.FC = () => {
  const whatsappUrl = "https://wa.me/5513996005779";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 animate-fade-in"
      aria-label="Fale conosco no WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
};

export default WhatsAppButton;