import React, { useState } from 'react';
import { Button, Card } from './UiComponents';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const steps: TutorialStep[] = [
  {
    title: "Welcome to NyayaSarathi",
    description: "Your AI companion for Indian law. We help you navigate legal complexities with verified information.",
    icon: "fa-scale-balanced"
  },
  {
    title: "Document Generator",
    description: "Quickly draft FIRs, Affidavits, and Legal Notices. Fill in a few details and get a professional draft ready to download.",
    icon: "fa-file-contract"
  },
  {
    title: "IPC Explainer",
    description: "Search any section of the Indian Penal Code or BNS to get simplified explanations, elements of crime, and punishments.",
    icon: "fa-book-open"
  },
  {
    title: "Global Search",
    description: "Use the top search bar to ask anything across all modules. It's the fastest way to find legal help.",
    icon: "fa-magnifying-glass"
  },
  {
    title: "Verified Sources",
    description: "Every response comes with citations to official government websites and legal acts to ensure reliability.",
    icon: "fa-circle-check"
  }
];

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <Card className="w-full max-w-md overflow-hidden animate-scaleUp border-2 border-indigo-500/20">
        <div className="relative h-2 bg-gray-100 dark:bg-slate-900">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-3xl text-indigo-600 dark:text-indigo-400">
              <i className={`fas ${step.icon}`}></i>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
            {step.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
            {step.description}
          </p>
          
          <div className="flex items-center justify-between mt-10">
            <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0} className="text-xs">
              Previous
            </Button>
            
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-indigo-500' : 'bg-gray-300 dark:bg-slate-700'}`}
                ></div>
              ))}
            </div>
            
            <Button onClick={handleNext} className="min-w-[100px]">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Tutorial;