/**
 * Voice Guidance Provider
 * Context provider for voice guidance accessibility features
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const VoiceGuidanceContext = createContext(null);

// Voice command grammar for English and Swahili
const voiceCommands = {
    navigation: {
        'next': 'next',
        'endelea': 'next',
        'back': 'back',
        'rudi': 'back',
        'home': 'home',
        'nyumbani': 'home',
        'help': 'help',
        'msaada': 'help',
        'menu': 'menu',
        'menyu': 'menu'
    },
    assessment: {
        'option one': 'select_1',
        'chaguo moja': 'select_1',
        'option two': 'select_2',
        'chaguo mbili': 'select_2',
        'option three': 'select_3',
        'chaguo tatu': 'select_3',
        'option four': 'select_4',
        'chaguo nne': 'select_4',
        'submit': 'submit',
        'wasilisha': 'submit',
        'repeat': 'repeat',
        'rudia': 'repeat',
        'skip': 'skip',
        'ruka': 'skip'
    },
    general: {
        'stop': 'stop',
        'simama': 'stop',
        'pause': 'pause',
        'sitisha': 'pause',
        'continue': 'continue',
        'endelea': 'continue',
        'read': 'read',
        'soma': 'read'
    }
};

export const VoiceGuidanceProvider = ({ children }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechRate, setSpeechRate] = useState(1.0);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [language, setLanguage] = useState('en');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [lastCommand, setLastCommand] = useState(null);
    const [commandHandlers, setCommandHandlers] = useState({});

    // Speech synthesis
    const synth = window.speechSynthesis;

    // Speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = synth.getVoices();
            setAvailableVoices(voices);

            // Try to find a voice for the current language
            const langVoice = voices.find(v =>
                v.lang.startsWith(language === 'sw' ? 'sw' : 'en')
            );
            if (langVoice) {
                setSelectedVoice(langVoice);
            }
        };

        loadVoices();
        synth.onvoiceschanged = loadVoices;

        return () => {
            synth.onvoiceschanged = null;
        };
    }, [language, synth]);

    // Load preferences from localStorage
    useEffect(() => {
        const savedEnabled = localStorage.getItem('voiceGuidanceEnabled');
        const savedRate = localStorage.getItem('voiceGuidanceSpeechRate');
        const savedLang = localStorage.getItem('voiceGuidanceLanguage');

        if (savedEnabled === 'true') setIsEnabled(true);
        if (savedRate) setSpeechRate(parseFloat(savedRate));
        if (savedLang) setLanguage(savedLang);
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('voiceGuidanceEnabled', isEnabled.toString());
        localStorage.setItem('voiceGuidanceSpeechRate', speechRate.toString());
        localStorage.setItem('voiceGuidanceLanguage', language);
    }, [isEnabled, speechRate, language]);

    // Setup speech recognition
    useEffect(() => {
        if (!recognition) return;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === 'sw' ? 'sw-KE' : 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log('[VoiceGuidance] Recognized:', transcript);
            processCommand(transcript);
        };

        recognition.onerror = (event) => {
            console.error('[VoiceGuidance] Recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }, [recognition, language]);

    /**
     * Speak text using speech synthesis
     */
    const speak = useCallback((text, options = {}) => {
        if (!isEnabled || !text) return;

        // Cancel any ongoing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || speechRate;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synth.speak(utterance);
    }, [isEnabled, speechRate, selectedVoice, synth]);

    /**
     * Stop speaking
     */
    const stopSpeaking = useCallback(() => {
        synth.cancel();
        setIsSpeaking(false);
    }, [synth]);

    /**
     * Start listening for voice commands
     */
    const startListening = useCallback(() => {
        if (!recognition || !isEnabled) return;

        try {
            recognition.start();
            setIsListening(true);
        } catch (error) {
            console.error('[VoiceGuidance] Failed to start recognition:', error);
        }
    }, [recognition, isEnabled]);

    /**
     * Stop listening
     */
    const stopListening = useCallback(() => {
        if (!recognition) return;

        try {
            recognition.stop();
            setIsListening(false);
        } catch (error) {
            console.error('[VoiceGuidance] Failed to stop recognition:', error);
        }
    }, [recognition]);

    /**
     * Process recognized voice command
     */
    const processCommand = useCallback((transcript) => {
        // Check all command categories
        for (const category of Object.values(voiceCommands)) {
            for (const [phrase, action] of Object.entries(category)) {
                if (transcript.includes(phrase)) {
                    setLastCommand({ phrase, action, timestamp: Date.now() });

                    // Execute registered handler
                    if (commandHandlers[action]) {
                        commandHandlers[action]();
                        speak(`Executing ${action.replace('_', ' ')}`);
                    }
                    return;
                }
            }
        }

        // Command not recognized
        speak(language === 'sw'
            ? 'Samahani, sikuelewa. Jaribu tena.'
            : 'Sorry, I did not understand. Please try again.'
        );
    }, [commandHandlers, speak, language]);

    /**
     * Register a command handler
     */
    const registerCommandHandler = useCallback((action, handler) => {
        setCommandHandlers(prev => ({
            ...prev,
            [action]: handler
        }));
    }, []);

    /**
     * Unregister a command handler
     */
    const unregisterCommandHandler = useCallback((action) => {
        setCommandHandlers(prev => {
            const newHandlers = { ...prev };
            delete newHandlers[action];
            return newHandlers;
        });
    }, []);

    /**
     * Announce page change
     */
    const announcePageChange = useCallback((pageName) => {
        if (!isEnabled) return;

        const announcement = language === 'sw'
            ? `Umefikia ukurasa wa ${pageName}`
            : `You are now on the ${pageName} page`;

        speak(announcement);
    }, [isEnabled, language, speak]);

    /**
     * Announce action result
     */
    const announceAction = useCallback((action, success = true) => {
        if (!isEnabled) return;

        const messages = {
            en: {
                success: `${action} completed successfully`,
                error: `${action} failed. Please try again.`
            },
            sw: {
                success: `${action} imekamilika`,
                error: `${action} imeshindwa. Tafadhali jaribu tena.`
            }
        };

        speak(messages[language][success ? 'success' : 'error']);
    }, [isEnabled, language, speak]);

    /**
     * Read element content
     */
    const readElement = useCallback((element) => {
        if (!isEnabled || !element) return;

        const text = element.textContent || element.innerText;
        if (text) {
            speak(text);
        }
    }, [isEnabled, speak]);

    /**
     * Toggle voice guidance
     */
    const toggle = useCallback(() => {
        setIsEnabled(prev => {
            const newValue = !prev;
            if (newValue) {
                speak(language === 'sw'
                    ? 'Mwongozo wa sauti umewashwa'
                    : 'Voice guidance enabled'
                );
            }
            return newValue;
        });
    }, [language, speak]);

    const value = {
        // State
        isEnabled,
        isSpeaking,
        isListening,
        speechRate,
        selectedVoice,
        language,
        availableVoices,
        lastCommand,

        // Actions
        setIsEnabled,
        setSpeechRate,
        setSelectedVoice,
        setLanguage,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        registerCommandHandler,
        unregisterCommandHandler,
        announcePageChange,
        announceAction,
        readElement,
        toggle,

        // Utilities
        voiceCommands,
        isSupported: !!synth && !!recognition
    };

    return (
        <VoiceGuidanceContext.Provider value={value}>
            {children}
        </VoiceGuidanceContext.Provider>
    );
};

export const useVoiceGuidance = () => {
    const context = useContext(VoiceGuidanceContext);
    if (!context) {
        throw new Error('useVoiceGuidance must be used within VoiceGuidanceProvider');
    }
    return context;
};

export default VoiceGuidanceContext;
