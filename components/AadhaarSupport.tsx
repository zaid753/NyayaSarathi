import React from 'react';
import { Card } from './UiComponents';

interface AadhaarSupportProps {
  onOptionSelect: (option: string) => void;
  isLoading: boolean;
}

const AadhaarSupport: React.FC<AadhaarSupportProps> = ({ onOptionSelect, isLoading }) => {
  const aadhaarTopics = [
    { icon: 'fa-address-card', title: 'Update Address', desc: 'Process to change address online with valid proof.' },
    { icon: 'fa-fingerprint', title: 'Lock Biometrics', desc: 'Secure your Aadhaar by locking authentication access.' },
    { icon: 'fa-id-badge', title: 'Lost Aadhaar', desc: 'Retrieve UID/EID or download e-Aadhaar.' },
    { icon: 'fa-link', title: 'Link Mobile/Email', desc: 'Find nearest enrollment center for linking mobile number.' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Aadhaar Services Support</h2>
        <p className="text-gray-600 dark:text-gray-400">Get official guidance on UIDAI services. We do not collect your biometric data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aadhaarTopics.map((type) => (
          <button
            key={type.title}
            onClick={() => onOptionSelect(`How do I ${type.title}? ${type.desc}`)}
            disabled={isLoading}
            className="text-left group"
          >
            <Card className="h-full p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
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

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50 rounded-xl flex items-start gap-3">
        <i className="fas fa-triangle-exclamation text-yellow-600 dark:text-yellow-400 mt-1"></i>
        <div>
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 text-sm">Security Warning</h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
            <strong>Never share your OTP</strong> or Aadhaar number with anyone over chat. NyayaSathi only provides information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AadhaarSupport;
