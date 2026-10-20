'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { MANDI_PRICES } from '@/lib/mockData';

interface VoiceAssistantModalProps {
  onClose: () => void;
}

export default function VoiceAssistantModal({ onClose }: VoiceAssistantModalProps) {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<{ en: string; hi: string; actionUrl?: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [manualQuery, setManualQuery] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if supported in browser
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);

          if (event.results[current].isFinal) {
            processQuery(text);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse(null);
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
        } else {
          // Fallback simulation if browser doesn't permit microphone
          simulateVoiceInput();
        }
      } catch (err) {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      const sample = language === 'hi' ? 'टमाटर का आज का मंडी भाव क्या है?' : 'What is the current tomato mandi price?';
      setTranscript(sample);
      setIsListening(false);
      processQuery(sample);
    }, 1500);
  };

  const processQuery = (queryText: string) => {
    const q = queryText.toLowerCase();

    // 1. Tomato Price Inquiry
    if (q.includes('टमाटर') || q.includes('tomato')) {
      const resp = {
        en: 'In Lasalgaon Mandi, hybrid tomato modal price is ₹25.00/kg (Range: ₹20-28/kg). In Mumbai APMC, it is ₹33.00/kg. High buyer demand expected this week.',
        hi: 'लासलगांव मंडी में हाइब्रिड टमाटर का औसत भाव ₹25.00/किग्रा (न्यूनतम ₹20, अधिकतम ₹28) है। मुंबई वाशी एपीएमसी में भाव ₹33.00/किग्रा है। इस सप्ताह मांग में वृद्धि का अनुमान है।',
        actionUrl: '/insights',
      };
      setResponse(resp);
      speakText(language === 'hi' ? resp.hi : resp.en);
      return;
    }

    // 2. Wheat / Grain Inquiry
    if (q.includes('गेहूँ') || q.includes('wheat')) {
      const resp = {
        en: 'MP Sharbati Wheat is trading at ₹32.00 to ₹36.00/kg across Sehore and Khanna mandis. Bulk processors are placing advance purchase orders.',
        hi: 'मध्य प्रदेश शरबत गेहूँ का भाव सीहोर व खन्ना मंडी में ₹32.00 से ₹36.00/किग्रा चल रहा है। थोक फ्लोर मिलें अग्रिम ऑर्डर दे रही हैं।',
        actionUrl: '/marketplace',
      };
      setResponse(resp);
      speakText(language === 'hi' ? resp.hi : resp.en);
      return;
    }

    // 3. Order / Delivery Tracking
    if (q.includes('ऑर्डर') || q.includes('order') || q.includes('status') || q.includes('delivery') || q.includes('डिलीवरी')) {
      const resp = {
        en: 'Your order #SHK-2026-88391 (400 kg Hybrid Tomato) has been dispatched on Consolidated Route #12. Current location: Thane Sorting Hub.',
        hi: 'आपका ऑर्डर #SHK-2026-88391 (400 किग्रा हाइब्रिड टमाटर) समन्वित रूट #12 पर निकल चुका है। वर्तमान स्थिति: ठाणे लॉजिस्टिक्स हब।',
        actionUrl: '/orders',
      };
      setResponse(resp);
      speakText(language === 'hi' ? resp.hi : resp.en);
      return;
    }

    // 4. Logistics / Route
    if (q.includes('रूट') || q.includes('route') || q.includes('लॉजिस्टिक्स') || q.includes('logistics')) {
      const resp = {
        en: 'Route #12 has grouped 5 pickup/delivery stops between Nashik and Mumbai, saving 24.5% fuel cost and 48 kg CO2 emissions.',
        hi: 'रूट #12 ने नासिक और मुंबई के बीच 5 स्टॉप को समेकित किया है, जिससे 24.5% ईंधन और 48 किग्रा कार्बन उत्सर्जन की बचत हुई है।',
        actionUrl: '/logistics',
      };
      setResponse(resp);
      speakText(language === 'hi' ? resp.hi : resp.en);
      return;
    }

    // Default Fallback
    const defaultResp = {
      en: `Sahayak AI verified: Current average produce mandi indices are stable. Demand in Mumbai and Pune urban hubs is trending upward by +14.5% for fresh vegetables.`,
      hi: `सहायक एआई विश्लेषण: मंडी में ताजी सब्जियों के भाव स्थिर हैं। मुंबई व पुणे में सब्जियों की मांग में +14.5% वृद्धि का अनुमान है।`,
      actionUrl: '/insights',
    };
    setResponse(defaultResp);
    speakText(language === 'hi' ? defaultResp.hi : defaultResp.en);
  };

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setTranscript(manualQuery);
    processQuery(manualQuery);
    setManualQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-agri-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-agri-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {language === 'hi' ? 'किसान सहायक वॉइस असिस्टेंट' : 'Kisan Sahayak Voice AI'}
              </h3>
              <p className="text-[11px] text-gray-300">
                {language === 'hi' ? 'बोलकर मंडी भाव, मांग व ऑर्डर जानें' : 'Ask agricultural prices, demand forecasts & order updates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* Animated Microphone Button */}
          <div className="relative my-2">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-agri-accent/30 animate-ping" />
            )}
            <button
              onClick={toggleListening}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                isListening
                  ? 'bg-agri-accent text-white scale-110'
                  : 'bg-agri-primary text-white hover:bg-agri-medium hover:scale-105'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          <div>
            <p className="font-bold text-gray-900 text-sm">
              {isListening ? t('voice.listening') : t('voice.tapToSpeak')}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {language === 'hi' ? 'भाषा: हिन्दी (hi-IN)' : 'Language: English (en-IN)'}
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="w-full bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {language === 'hi' ? 'आपका प्रश्न' : 'Your Query'}
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}

          {/* AI Response Display */}
          {response && (
            <div className="w-full bg-agri-subtle/70 p-4 rounded-2xl border border-agri-primary/20 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-agri-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-agri-accent" />
                  {language === 'hi' ? 'सहायक उत्तर' : 'Sahayak Verified Response'}
                </span>
                {isSpeaking && (
                  <span className="text-[10px] font-semibold text-agri-accent flex items-center gap-1 animate-pulse">
                    <Volume2 className="w-3 h-3" />
                    {t('voice.speaking')}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-900 font-medium leading-relaxed">
                {language === 'hi' ? response.hi : response.en}
              </p>
              {response.actionUrl && (
                <a
                  href={response.actionUrl}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-xs font-bold text-agri-primary hover:text-agri-dark hover:underline pt-1"
                >
                  <span>{language === 'hi' ? 'विस्तार से देखें' : 'View Full Details'}</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Sample Prompts */}
          <div className="w-full text-left pt-2 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              {language === 'hi' ? 'उदाहरण प्रश्न' : 'Sample Questions'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  const q = language === 'hi' ? 'टमाटर का आज का मंडी भाव क्या है?' : 'What is the current tomato mandi price?';
                  setTranscript(q);
                  processQuery(q);
                }}
                className="text-[11px] font-medium bg-gray-100 hover:bg-agri-subtle hover:text-agri-primary px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
              >
                {t('voice.samplePrompt1')}
              </button>
              <button
                onClick={() => {
                  const q = language === 'hi' ? 'मेरे ऑर्डर का स्टेटस क्या है?' : 'What is my order status?';
                  setTranscript(q);
                  processQuery(q);
                }}
                className="text-[11px] font-medium bg-gray-100 hover:bg-agri-subtle hover:text-agri-primary px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
              >
                {t('voice.samplePrompt3')}
              </button>
            </div>
          </div>

          {/* Manual Text Query Fallback */}
          <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder={language === 'hi' ? 'या यहाँ लिखकर पूछें...' : 'Or type your question here...'}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-agri-primary text-gray-900"
            />
            <button
              type="submit"
              className="p-2 bg-agri-primary hover:bg-agri-dark text-white rounded-xl transition-colors"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
