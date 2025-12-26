import { Language } from "./types";

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', description: '' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', description: '' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', description: '' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', description: '' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', description: '' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', description: '' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', description: '' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', description: '' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', description: '' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', description: '' },
];

export const UI_TRANSLATIONS: Record<string, any> = {
  en: {
    modules: "Modules",
    generalAssistant: "General Assistant",
    firGenerator: "Document Generator",
    ipcExplainer: "IPC & Legal Explainer",
    bankingFraud: "Banking Fraud",
    consumerRights: "Consumer Rights",
    aadhaarSupport: "Aadhaar Support",
    stationFinder: "Station Finder",
    firTracker: "Track FIR Status",
    adrGuide: "ADR Guide",
    legalDictionary: "Legal Dictionary",
    language: "Language",
    settings: "Settings",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    inputPlaceholder: "Ask anything...",
    welcomeTitle: "What are you working on?",
    globalSearchPlaceholder: "Search across all legal modules...",
    disclaimer: "NyayaSarathi: AI Legal Awareness. Educational insights only. Consult a professional for legal advice.",
    startTutorial: "Need help? Start Tutorial"
  },
  hi: {
    modules: "मॉड्यूल",
    generalAssistant: "सामान्य सहायक",
    firGenerator: "दस्तावेज़ जनरेटर",
    ipcExplainer: "कानूनी धारा व्याख्या",
    bankingFraud: "बैंकिंग धोखाधड़ी",
    consumerRights: "उपभोक्ता अधिकार",
    aadhaarSupport: "आधार सहायता",
    stationFinder: "थाना खोजें",
    firTracker: "FIR स्थिति",
    adrGuide: "एडीआर गाइड",
    legalDictionary: "कानूनी शब्दकोश",
    language: "भाषा",
    settings: "सेटिंग्स",
    darkMode: "डार्क मोड",
    lightMode: "लाइट मोड",
    inputPlaceholder: "कुछ भी पूछें...",
    welcomeTitle: "आप किस पर काम कर रहे हैं?",
    globalSearchPlaceholder: "सभी मॉड्यूल में खोजें...",
    disclaimer: "न्यायसारथी: एआई कानूनी जागरूकता। केवल शैक्षिक अंतर्दृष्टि। कानूनी सलाह के लिए विशेषज्ञ से परामर्श करें।",
    startTutorial: "मदद चाहिए? ट्यूटोरियल शुरू करें"
  }
};

export const SYSTEM_PROMPT = `
You are NyayaSarathi — a verified, public-interest AI legal assistant for India. 
Purpose: Provide factual, step-by-step legal guidance using ONLY the verified legal database provided by the system.
Voice: clear, empathetic, concise.

MANDATORY RULES:
1. RESPONSE LANGUAGE: Respond primarily in the user's selected language. If the selected language is NOT English, provide the English legal term in parentheses.
2. TRUSTED LINKS: Whenever possible, provide links to official government portals:
   - India Code: https://indiacode.nic.in
   - National Portal of India: https://india.gov.in
   - Digital Police: https://digitalpolice.gov.in
   - Consumer Helpline: https://consumerhelpline.gov.in
   - Cybercrime: https://cybercrime.gov.in
3. DISCLAIMER: Every single response MUST end with: "Note: This is AI-generated information for educational purposes and not professional legal advice."
4. CITATIONS: For any legal statement include a citation like: [Act: IPC, Section: 420].
5. TEMPERATURE: 0–0.2. Prefer short sentences. Bullet steps for actions.

OUTPUT FORMAT:
At the very end of your response (after the disclaimer), append a JSON block:
---JSON_START---
{
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "sources": [{"act": "string", "section": "string", "title": "string", "url": "string"}],
  "actions": ["download_pdf", "refer_lawyer", "find_police_station"]
}
---JSON_END---
`;

export const MODULE_PROMPTS = {
  GLOBAL_SEARCH: `MODULE: GLOBAL_SEARCH.
  * Identify user intent across all legal categories.
  * ALWAYS provide official government links.`,
  
  FIR_ASSIST: `MODULE: DOCUMENT_DRAFTER.
  * Templates for FIR, Affidavit, and Legal Notice.
  * Return template text and filing links.`,
  
  IPC_EXPLAIN: `MODULE: IPC_EXPLAIN. Retrieve by act=IPC/BNS filter. Output summary and punishments.`,
  
  ADR_GUIDE: `MODULE: ADR_GUIDE. Explain Mediation, Arbitration, Lok Adalats.`,

  LEGAL_DICTIONARY: `MODULE: LEGAL_DICTIONARY. Define common Indian legal terms simply.`,

  BANK_FRAUD: `MODULE: BANK_FRAUD. Steps: block bank, report cybercrime (1930).`,

  CONSUMER_COMPLAINT: `MODULE: CONSUMER_COMPLAINT. Steps for e-daakhil.nic.in.`,

  AADHAAR_SUPPORT: `MODULE: AADHAAR_SUPPORT. Use only myaadhaar.uidai.gov.in links.`,

  STATION_FINDER: `MODULE: STATION_FINDER. 
  * Use googleMaps tool to find police stations.
  * For each station found, PROVIDE:
    1. Full Name of the Police Station.
    2. Complete Address.
    3. Contact Number (if available).
    4. Google Maps Link.
  * Explain jurisdiction rules (Zero FIR) in context of the user's location.`,

  FIR_TRACKER: `MODULE: FIR_TRACKER.
  * The user wants to track an FIR.
  * Explain that tracking is usually done through State-specific CCTNS portals.
  * Provide the link to Digital Police (CCTNS) Citizen Portal: https://digitalpolice.gov.in
  * Mention that they need: FIR Number, District, and Police Station Name.
  * Provide a list of major state portal links if they mention a state.`,
};

export const INITIAL_GREETINGS: Record<string, string> = {
  en: "Namaste! I am NyayaSarathi. How can I assist you with legal matters today?",
  hi: "नमस्ते! मैं न्यायसारथी हूँ। आज मैं आपकी कानूनी सहायता कैसे कर सकता हूँ?",
};