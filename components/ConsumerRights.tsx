import React from 'react';
import { Card } from './UiComponents';

interface ConsumerRightsProps {
  onOptionSelect: (option: string) => void;
  isLoading: boolean;
}

const ConsumerRights: React.FC<ConsumerRightsProps> = ({ onOptionSelect, isLoading }) => {
  const rightsTopics = [
    { icon: 'fa-box-open', title: 'Defective Product', desc: 'Received damaged or fake goods from online/offline store.' },
    { icon: 'fa-hand-holding-dollar', title: 'Service Deficiency', desc: 'Insurance claim rejected or poor service quality.' },
    { icon: 'fa-scale-balanced', title: 'E-Daakhil Complaint', desc: 'How to file a consumer complaint online digitally.' },
    { icon: 'fa-tag', title: 'MRP Violation', desc: 'Charged more than Maximum Retail Price.' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Consumer Rights & Complaints</h2>
        <p className="text-gray-600 dark:text-gray-400">Identify violations and get step-by-step guidance to file complaints under the Consumer Protection Act, 2019.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rightsTopics.map((type) => (
          <button
            key={type.title}
            onClick={() => onOptionSelect(`I need help regarding ${type.title}. ${type.desc}`)}
            disabled={isLoading}
            className="text-left group"
          >
            <Card className="h-full p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
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

      <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 rounded-xl flex items-start gap-3">
        <i className="fas fa-gavel text-orange-600 dark:text-orange-400 mt-1"></i>
        <div>
          <h4 className="font-semibold text-orange-900 dark:text-orange-200 text-sm">Consumer Helpline (NCH)</h4>
          <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
            You can also call the National Consumer Helpline at <strong>1915</strong> for immediate grievance redressal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsumerRights;
