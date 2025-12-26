import React, { useState } from 'react';
import { Message } from '../types';
import { Badge, Button, Card } from './UiComponents';
import { jsPDF } from "jspdf";

interface ChatMessageProps {
  message: Message;
  onFeedback?: (messageId: string, type: 'positive' | 'negative' | 'reported') => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onFeedback }) => {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState<'positive' | 'negative' | 'reported' | null>(
    (message.feedback as any) || null
  );
  
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const boldPattern = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldPattern);
      
      const content = parts.map((part, idx) => {
        if (idx % 2 === 1) return <strong key={idx} className="font-bold text-indigo-900 dark:text-indigo-200">{part}</strong>;
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc marker:text-gray-400 dark:marker:text-gray-500 mb-1">{content}</li>;
      }
      return <p key={i} className="min-h-[1rem] leading-7 mb-2 last:mb-0">{content}</p>;
    });
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFontSize(16);
    doc.setTextColor(30, 58, 138); 
    doc.text("NyayaSarathi - Generated Draft", margin, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 26);
    
    const cleanContent = message.text
      .replace(/\*\*/g, '') 
      .replace(/##/g, '')   
      .replace(/\[Act:.*?\]/g, '');

    const lines = doc.splitTextToSize(cleanContent, maxLineWidth);
    doc.text(lines, margin, 35);
    doc.save("NyayaSarathi_Draft.pdf");
  };

  const getSourceUrl = (src: { url?: string, act: string, section: string, title: string }) => {
    const searchTerm = [src.act, src.section, src.title].filter(Boolean).join(' ');
    const query = `${searchTerm} official text India`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  const handleFeedbackClick = (type: 'positive' | 'negative' | 'reported') => {
    if (feedback === type) return;
    setFeedback(type);
    if (onFeedback) onFeedback(message.id, type);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm border ${
          isUser 
            ? 'bg-indigo-600 border-indigo-500' 
            : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700'
        }`}>
          {isUser ? (
            <i className="fas fa-user text-white text-xs"></i>
          ) : (
             <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-sm flex items-center justify-center">
               <i className="fas fa-scale-balanced text-[10px] text-white"></i>
             </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
          <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base transition-all ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-200 dark:shadow-none' 
              : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-slate-700 rounded-tl-sm'
          }`}>
            <div className="markdown-body font-normal tracking-wide">
              {renderText(message.text)}
            </div>
          </div>

          {!isUser && (
            <div className="mt-3 w-full max-w-lg pl-1 flex flex-col gap-3">
              {message.metadata && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider">Verified Confidence</span>
                    <Badge color={
                      message.metadata.confidence === 'HIGH' ? 'green' : 
                      message.metadata.confidence === 'MEDIUM' ? 'yellow' : 'red'
                    }>
                      {message.metadata.confidence}
                    </Badge>
                  </div>

                  {message.metadata.groundingChunks && message.metadata.groundingChunks.length > 0 && (
                    <Card className="p-3 bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
                      <h4 className="text-[11px] font-bold text-green-900 dark:text-green-300 mb-3 uppercase flex items-center gap-2">
                        <i className="fas fa-map-location-dot"></i> Grounding Results
                      </h4>
                      <ul className="space-y-3">
                        {message.metadata.groundingChunks.map((chunk, idx) => {
                          const item = chunk.maps || chunk.web;
                          if (!item) return null;
                          return (
                            <li key={idx} className="text-xs text-green-800 dark:text-green-200 border-b border-green-200/50 dark:border-green-900/30 pb-2 last:border-0 last:pb-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-sm">{item.title}</span>
                                <a href={item.uri} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 font-bold hover:underline text-[10px] flex items-center gap-1 shrink-0 bg-white dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                                  {chunk.maps ? 'View on Maps' : 'Visit Web'} <i className="fas fa-external-link-alt text-[9px]"></i>
                                </a>
                              </div>
                              {chunk.maps && (
                                <p className="opacity-80 leading-relaxed font-medium">
                                  <i className="fas fa-location-dot mr-1 opacity-60"></i> Official Location Found via Google Maps
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </Card>
                  )}

                  {message.metadata.sources.length > 0 && (
                    <Card className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                      <h4 className="text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-2 uppercase flex items-center gap-2">
                        <i className="fas fa-book-open"></i> Sources
                      </h4>
                      <ul className="space-y-2">
                        {message.metadata.sources.map((src, idx) => (
                          <li key={idx} className="text-xs text-blue-800 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-semibold px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[10px] border border-blue-200 dark:border-slate-600 shadow-sm shrink-0">
                              {src.act} §{src.section}
                            </span>
                            <span className="truncate flex-1 opacity-90">{src.title}</span>
                            <a href={getSourceUrl(src)} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline text-[10px] flex items-center gap-1">
                              Verify <i className="fas fa-external-link-alt text-[9px]"></i>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {message.metadata.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.metadata.actions.includes('download_pdf') && (
                        <Button variant="secondary" className="text-[10px] py-1 h-7 flex items-center gap-2" onClick={handleDownloadPdf}>
                          <i className="fas fa-file-pdf text-red-500"></i> Download Draft
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Feedback Mechanism */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Helpful?</span>
                <div className="flex gap-1">
                  <button onClick={() => handleFeedbackClick('positive')} className={`p-1.5 rounded-lg transition-colors ${feedback === 'positive' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                    <i className="fas fa-thumbs-up text-xs"></i>
                  </button>
                  <button onClick={() => handleFeedbackClick('negative')} className={`p-1.5 rounded-lg transition-colors ${feedback === 'negative' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                    <i className="fas fa-thumbs-down text-xs"></i>
                  </button>
                </div>
                <div className="w-px h-3 bg-gray-200 dark:bg-slate-700 mx-1"></div>
                <button 
                  onClick={() => handleFeedbackClick('reported')}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${feedback === 'reported' ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                >
                  <i className="fas fa-circle-exclamation text-[9px]"></i> {feedback === 'reported' ? 'Reported' : 'Report Inaccuracy'}
                </button>
              </div>
            </div>
          )}
          
          <span className="text-[10px] text-gray-400 dark:text-slate-600 mt-1.5 px-1 font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;