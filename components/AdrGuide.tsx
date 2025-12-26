
import React from 'react';
import { Card } from './UiComponents';

interface AdrGuideProps {
  onOptionSelect: (option: string) => void;
  isLoading: boolean;
}

const AdrGuide: React.FC<AdrGuideProps> = ({ onOptionSelect, isLoading }) => {
  const adrMethods = [
    { icon: 'fa-handshake', title: 'Mediation', desc: 'A neutral third party helps both sides reach a voluntary settlement. Popular in family/civil cases.' },
    { icon: 'fa-gavel', title: 'Arbitration', desc: 'A private judge (arbitrator) makes a binding decision outside of court. Common in business/contracts.' },
    { icon: 'fa-users-between-lines', title: 'Conciliation', desc: 'Similar to mediation but the third party (conciliator) can propose solutions.' },
    { icon: 'fa-building-columns', title: 'Lok Adalat', desc: 'People\'s Court for quick settlement of cases already pending in court or pre-litigation.' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Alternative Dispute Resolution (ADR)</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Avoid long court battles. ADR provides faster, private, and cost-effective ways to resolve legal disputes in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adrMethods.map((method) => (
          <button
            key={method.title}
            onClick={() => onOptionSelect(`I want to learn more about starting ${method.title}. ${method.desc}`)}
            disabled={isLoading}
            className="text-left group"
          >
            <Card className="h-full p-6 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <i className={`fas ${method.icon}`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{method.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{method.desc}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/30 border border-blue-100 dark:border-indigo-900/50 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <i className="fas fa-circle-info text-indigo-600 dark:text-indigo-400"></i>
          <h4 className="font-bold text-gray-900 dark:text-white">Why choose ADR?</h4>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2"><i className="fas fa-bolt text-yellow-500 text-[10px]"></i> Saves years of trial time</li>
          <li className="flex items-center gap-2"><i className="fas fa-bolt text-yellow-500 text-[10px]"></i> Significant cost savings</li>
          <li className="flex items-center gap-2"><i className="fas fa-bolt text-yellow-500 text-[10px]"></i> Confidential proceedings</li>
          <li className="flex items-center gap-2"><i className="fas fa-bolt text-yellow-500 text-[10px]"></i> Amicable relationships</li>
        </ul>
      </div>
    </div>
  );
};

export default AdrGuide;
