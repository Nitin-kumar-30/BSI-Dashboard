import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InvokeLLM } from "@/api/integrations";
import { Bot, Send, Loader2, Sparkles, X, Mic, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function AIAssistantFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        // Filter to only show 2 voices - one male and one female for English
        const englishVoices = availableVoices.filter(v => v.lang.startsWith('en-'));
        const femaleVoice = englishVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira'));
        const maleVoice = englishVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('mark'));
        
        const selectedVoices = [
          femaleVoice || englishVoices.find(v => v.voiceURI.includes('female')) || englishVoices[0],
          maleVoice || englishVoices.find(v => v.voiceURI.includes('male')) || englishVoices[1]
        ].filter(Boolean);
        
        setVoices(selectedVoices);
        if (selectedVoices.length > 0 && !selectedVoiceURI) {
          setSelectedVoiceURI(selectedVoices[0].voiceURI);
        }
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, [selectedVoiceURI]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if(finalTranscript) {
        setInput(prev => prev + finalTranscript + ' ');
      }
    };
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };
  
  const speakMessage = (text) => {
    stopSpeaking(); // Stop any previous speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported in this browser.");
    }
  };

  const handleClose = () => {
    stopSpeaking(); // Stop speaking when closing the chat
    if (isListening) recognitionRef.current?.stop();
    setIsOpen(false);
  };

  const handleSendMessage = async (event) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    stopSpeaking();

    try {
      const response = await InvokeLLM({
        prompt: `You are BSI Bot (Brand Street Intelligence Bot), the advanced AI assistant for Brand Street Hub CRM.

        PERSONALITY: You are a highly intelligent, professional, and slightly futuristic AI with deep knowledge of business operations. You speak in a confident, helpful manner and always provide actionable insights.

        CAPABILITIES: You have complete access to and knowledge of:
        - Contact Management (leads, prospects, clients across all industries)
        - Sales Pipeline (stages: Prospecting, Qualified, Proposal, Negotiation, Closed Won/Lost)  
        - Marketing Campaigns (Email, Social Media, Google Ads, LinkedIn, etc.)
        - HR Management (employees, performance, departments)
        - Procurement & Vendor Management
        - Financial Analytics & Budgets
        - Design Projects & Assets

        CONTEXT: You work within Brand Street Hub, an integrated consultancy platform serving multiple business units including HR, Procurement, Business Development (East/West/North/South), Lead Generation, Design, and Finance departments.

        RESPONSE STYLE: 
        - Be concise but comprehensive
        - Provide specific metrics and data when possible
        - Offer actionable recommendations
        - If asked for specific data you don't have, generate realistic example data that fits the context

        User Query: "${input}"`,
        add_context_from_internet: false
      });

      const botMessageContent = typeof response === 'string' ? response : JSON.stringify(response);
      const botMessage = { id: Date.now() + 1, role: 'assistant', content: botMessageContent };
      setMessages(prev => [...prev, botMessage]);
      speakMessage(botMessageContent);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: "I apologize, but I'm experiencing connectivity issues with my core systems. Please try your request again in a moment." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
  const currentVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

  return (
    <>
      <style>{`
        .ai-fab {
          background: linear-gradient(135deg, #00CFE8 0%, #8b5cf6 100%);
          box-shadow: 
            0 8px 32px rgba(0, 207, 232, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: fabPulse 2s infinite;
        }
        
        .ai-fab:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 
            0 12px 40px rgba(0, 207, 232, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.2);
        }
        
        @keyframes fabPulse {
          0%, 100% { 
            box-shadow: 0 8px 32px rgba(0, 207, 232, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
          }
          50% { 
            box-shadow: 0 8px 32px rgba(0, 207, 232, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.3);
          }
        }
        
        @keyframes listeningPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
        
        .mic-listening {
          animation: listeningPulse 2s infinite;
          background-color: #ef4444 !important;
        }
        
        .glass-card {
          background: rgba(0, 0, 0, 0.7); /* Darker transparent background */
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1); /* Lighter border */
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3), /* Darker shadow */
            0 8px 32px rgba(0, 0, 0, 0.4); /* Another dark shadow */
        }
      `}</style>

      {/* FAB Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="ai-fab rounded-full w-16 h-16 transition-all duration-300 flex items-center justify-center relative overflow-hidden group"
        >
          <Sparkles className="w-8 h-8 text-white relative z-10 group-hover:animate-ping" />
        </Button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-8 z-50 w-96 h-[70vh] glass-card rounded-3xl"
          >
            <Card className="w-full h-full bg-transparent border-0 shadow-none flex flex-col">
              {/* Header */}
              <CardHeader className="pb-3 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        BSI Assistant
                      </CardTitle>
                      <p className="text-slate-400 text-sm">Your AI Business Intelligence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-8 px-3">
                          {currentVoice ? (currentVoice.name.includes('Female') || currentVoice.name.includes('female') || currentVoice.name.includes('Samantha') ? 'Female' : 'Male') : 'Voice'}
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        {englishVoices.map((voice) => (
                          <DropdownMenuItem key={voice.voiceURI} onClick={() => setSelectedVoiceURI(voice.voiceURI)} className="text-slate-200">
                            {voice.name.includes('Female') || voice.name.includes('female') || voice.name.includes('Samantha') || voice.name.includes('Zira') ? 'Female Voice' : 'Male Voice'}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
                        <Bot className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-lg font-semibold text-white mb-2">Hello! I'm BSI Assistant</p>
                      <p className="text-sm opacity-80">Ask me anything about your CRM data!</p>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`flex gap-2 items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-slate-800 text-slate-200 shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      {msg.role === 'assistant' && (
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10" onClick={() => isSpeaking ? stopSpeaking() : speakMessage(msg.content)}>
                          {isSpeaking ? <VolumeX className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-slate-800 p-3 rounded-2xl shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input */}
              <CardFooter className="p-4 border-t border-slate-700/50">
                <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                   <Button
                    type="button"
                    variant="outline"
                    onClick={toggleListening}
                    className={`rounded-full h-10 w-10 p-0 transition-all ${isListening ? 'mic-listening text-white' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Ask me anything..."}
                    className="flex-1 bg-slate-800 border-slate-700 rounded-full shadow-sm text-white focus:shadow-md transition-shadow"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-cyan-500 hover:bg-cyan-600 rounded-full w-10 h-10 p-0 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}