import React from 'react';
import { SocialProof } from '../types';

interface SocialProofCardProps {
  proof: SocialProof;
}

const SocialProofCard: React.FC<SocialProofCardProps> = ({ proof }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 w-full max-w-md mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <img
          src={proof.afterImage}
          alt={proof.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-200 flex-shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xl font-bold text-emerald-800">{proof.name}</p>
          <p className="text-2xl font-bold text-emerald-600">{proof.result}</p>
        </div>
      </div>
      <p className="text-center text-gray-600 mt-4 italic">
        {proof.description}
      </p>
    </div>
  );
};

export default SocialProofCard;