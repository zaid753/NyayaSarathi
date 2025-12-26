import React, { useState } from 'react';
import { FirFormData } from '../types';
import { Button, Card } from './UiComponents';

interface FirFormProps {
  onSubmit: (data: FirFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FormErrors {
  complainantName?: string;
  incidentDate?: string;
  place?: string;
  details?: string;
  offenseType?: string;
  documentType?: string;
  policeStation?: string;
}

const DOCUMENT_TYPES = [
  { value: 'FIR', label: 'First Information Report (FIR)' },
  { value: 'Affidavit', label: 'Affidavit (Legal Declaration)' },
  { value: 'Legal Notice', label: 'Legal Notice (Formal Demand)' },
] as const;

const OFFENSE_CATEGORIES = [
  { value: 'Theft/Robbery', label: 'Theft or Robbery' },
  { value: 'Cybercrime', label: 'Cybercrime (Online Fraud/Hacking)' },
  { value: 'Physical Assault', label: 'Physical Assault / Injury' },
  { value: 'Harassment', label: 'Harassment (Physical/Digital)' },
  { value: 'Property Dispute', label: 'Property / Land Dispute' },
  { value: 'Matrimonial', label: 'Matrimonial / Domestic Issues' },
  { value: 'Contract Violation', label: 'Contract / Agreement Breach' },
  { value: 'Other', label: 'Other / General' },
];

const EXAMPLES = {
  FIR: "Example: My black Honda Activa (Reg: DL-1S-AB-1234) was stolen from the Hauz Khas Metro parking lot between 10:00 AM and 2:00 PM today. I have the keys with me.",
  Affidavit: "Example: I wish to correct my name in my educational records. My current name is 'Rahul Kumar' but on my 10th certificate it is 'Rahu Kumar'. I have my Aadhaar card as proof of the correct spelling.",
  'Legal Notice': "Example: I am issuing this notice to M/S Builders Ltd regarding an unpaid refund of ₹50,000 for a cancelled booking dated Jan 12, 2023. I request the payment within 15 days."
};

const FirForm: React.FC<FirFormProps> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<FirFormData>({
    complainantName: '',
    incidentDate: '',
    incidentTime: '',
    place: '',
    details: '',
    policeStation: '',
    offenseType: '',
    documentType: 'FIR',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.complainantName.trim()) {
      newErrors.complainantName = 'Name is required';
    }

    if (formData.documentType === 'FIR') {
      if (!formData.incidentDate) newErrors.incidentDate = 'Date is required';
      else if (formData.incidentDate > today) newErrors.incidentDate = 'Date cannot be in the future';
      if (!formData.place.trim()) newErrors.place = 'Place of incident is required';
      if (!formData.policeStation.trim()) newErrors.policeStation = 'Police Station Name is required';
    }

    if (!formData.details.trim()) {
      newErrors.details = 'Please provide details for the draft';
    } else if (formData.details.length < 15) {
      newErrors.details = 'Details are too brief for a valid draft';
    }

    if (!formData.offenseType) {
      newErrors.offenseType = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClasses = (fieldName: keyof FormErrors) => `
    w-full rounded-lg border bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-2.5 shadow-sm 
    focus:outline-none focus:ring-1 transition-colors appearance-none
    ${errors[fieldName] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'}
  `;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 md:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Legal Document Generator</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Generate professional drafts for legal processes.</p>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Select Document Type</label>
        <div className="grid grid-cols-3 gap-2">
          {DOCUMENT_TYPES.map((doc) => (
            <button
              key={doc.value}
              type="button"
              onClick={() => setFormData({ ...formData, documentType: doc.value as any })}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                formData.documentType === doc.value 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500 hover:border-indigo-400'
              }`}
            >
              {doc.label.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {formData.documentType === 'FIR' ? 'Complainant Name' : formData.documentType === 'Affidavit' ? 'Deponent Name' : 'Sender Name'}
          </label>
          <input
            type="text"
            name="complainantName"
            value={formData.complainantName}
            onChange={handleChange}
            className={inputClasses('complainantName')}
          />
          {errors.complainantName && <p className="mt-1 text-xs text-red-500">{errors.complainantName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offense/Matter Category</label>
          <select
            name="offenseType"
            value={formData.offenseType}
            onChange={handleChange}
            className={inputClasses('offenseType')}
          >
            <option value="">Select Category</option>
            {OFFENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.offenseType && <p className="mt-1 text-xs text-red-500">{errors.offenseType}</p>}
        </div>
      </div>

      {formData.documentType === 'FIR' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Date</label>
              <div className="relative group">
                <input 
                  type="date" 
                  name="incidentDate" 
                  value={formData.incidentDate} 
                  onChange={handleChange} 
                  className={`${inputClasses('incidentDate')} pl-10 pr-3 h-11 cursor-pointer`} 
                />
                <i className="fas fa-calendar absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 pointer-events-none"></i>
              </div>
              {errors.incidentDate && <p className="mt-1 text-xs text-red-500">{errors.incidentDate}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Time</label>
              <div className="relative group">
                <input 
                  type="time" 
                  name="incidentTime" 
                  value={formData.incidentTime} 
                  onChange={handleChange} 
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-10 py-2.5 h-11 cursor-pointer appearance-none" 
                />
                <i className="fas fa-clock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 pointer-events-none"></i>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Place of Incident</label>
            <input type="text" name="place" value={formData.place} onChange={handleChange} className={inputClasses('place')} />
            {errors.place && <p className="mt-1 text-xs text-red-500">{errors.place}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Police Station Name</label>
            <input 
              type="text" 
              name="policeStation" 
              value={formData.policeStation} 
              onChange={handleChange} 
              className={inputClasses('policeStation' as any)} 
              placeholder="e.g. Hauz Khas Police Station"
            />
            {errors.policeStation && <p className="mt-1 text-xs text-red-500">{errors.policeStation}</p>}
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Statement / Facts</label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Provide a detailed account of the events or claims.</p>
        <textarea
          name="details"
          rows={4}
          value={formData.details}
          onChange={handleChange}
          className={inputClasses('details')}
          placeholder={formData.documentType === 'Legal Notice' ? "Describe the dispute and your demands..." : "Describe exactly what happened..."}
        />
        {errors.details && <p className="mt-1 text-xs text-red-500">{errors.details}</p>}
      </div>

      {/* Draft Examples Section */}
      <Card className="bg-slate-50 dark:bg-slate-900/50 p-4 border-dashed border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
          <i className="fas fa-lightbulb text-xs"></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">Guidance</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
          {EXAMPLES[formData.documentType as keyof typeof EXAMPLES]}
        </p>
      </Card>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-700">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Generating...' : `Generate ${formData.documentType} Draft`}
        </Button>
      </div>
    </form>
  );
};

export default FirForm;