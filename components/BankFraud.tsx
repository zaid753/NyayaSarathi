import React from 'react';
import { Button, Card } from './UiComponents';

interface BankFraudProps {
  onOptionSelect: (option: string) => void;
  isLoading: boolean;
}

const BankFraud: React.FC<BankFraudProps> = ({ onOptionSelect, isLoading }) => {
  const fraudTypes = [
    { icon: 'fa-credit-card', title: 'Credit Card Theft', desc: 'Card lost, stolen, or unauthorized charges.' },
    { icon: 'fa-mobile-screen', title: 'UPI / Net Banking', desc: 'Money deducted via UPI scam or fake QR code.' },
    { icon: 'fa-envelope-open-text', title: 'Phishing / OTP', desc: 'Shared OTP or clicked suspicious link.' },
    { icon: 'fa-id-card', title: 'Identity Theft', desc: 'Loans taken in your name without consent.' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Banking Fraud Assistance</h2>
        <p className="text-gray-600 dark:text-gray-400">Select the type of issue you are facing to get immediate RBI-compliant escalation steps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fraudTypes.map((type) => (
          <button
            key={type.title}
            onClick={() => onOptionSelect(`I need help with ${type.title}. ${type.desc}`)}
            disabled={isLoading}
            className="text-left group"
          >
            <Card className="h-full p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  <i className={`fas ${type.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{type.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{type.desc}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-start gap-3">
        <i className="fas fa-shield-halved text-indigo-600 dark:text-indigo-400 mt-1"></i>
        <div>
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 text-sm">Did you know?</h4>
          <p className="text-sm text-indigo-800 dark:text-indigo-300 mt-1">
            According to RBI guidelines, if you report unauthorized electronic banking transactions within <strong>3 days</strong>, your liability is zero.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BankFraud;
