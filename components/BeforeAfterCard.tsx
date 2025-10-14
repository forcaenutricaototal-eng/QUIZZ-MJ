import React from 'react';
import { SocialProof } from '../types';

interface BeforeAfterCardProps {
  proof: SocialProof;
}

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ proof }) => {
  const formattedTime = `12:05`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 mt-8 w-full max-w-sm mx-auto animate-fade-in text-gray-900">
      
      <div className="flex justify-between items-center mb-2">
        <p className="font-bold text-lg" style={{ color: '#d35400' }}>{proof.name}</p>
        <p className="font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md text-sm">{proof.result}</p>
      </div>

      {(proof.beforeImage || proof.afterImage) && (
        <div className="flex gap-2 rounded-lg overflow-hidden">
          {proof.beforeImage ? (
            <>
              <img
                  src={proof.beforeImage}
                  alt={`Foto de ${proof.name} antes`}
                  className="w-1/2 object-cover"
              />
              <img
                  src={proof.afterImage}
                  alt={`Foto de ${proof.name} depois`}
                  className="w-1/2 object-cover"
              />
            </>
          ) : (
            <img
              src={proof.afterImage}
              alt={`Foto de ${proof.name}`}
              className="w-full object-cover rounded-lg"
            />
          )}
        </div>
      )}


      <div className="relative pt-3">
        <p className="text-xl pr-12">{proof.description}</p>
        <div className="absolute bottom-0 right-0 text-sm text-gray-500">
            <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterCard;