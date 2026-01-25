/**
 * Consent Modal Component
 * Handles informed consent for research participation
 * Bilingual support (English/Swahili)
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import './ConsentModal.css';

// Consent content translations
const consentContent = {
    en: {
        title: 'Research Participation Consent',
        intro: 'Welcome to the SkillBridge Digital Skills Platform. This platform is part of a research study conducted by Mount Kenya University to evaluate the effectiveness of adaptive digital skills training for youth in Kiharu Constituency.',
        dataProtection: 'Your participation is governed by the Kenya Data Protection Act 2019. Your data will be handled with strict confidentiality.',
        sections: {
            research: {
                title: 'Research Data Collection',
                description: 'Allow collection of your learning progress, assessment scores, and platform usage for research analysis.',
                required: true
            },
            sharing: {
                title: 'Anonymized Data Sharing',
                description: 'Allow sharing of anonymized (non-identifiable) data in academic publications and reports.',
                required: false
            },
            surveys: {
                title: 'Economic Impact Surveys',
                description: 'Participate in follow-up surveys about how the training has affected your economic activities.',
                required: false
            },
            contact: {
                title: 'Follow-up Contact',
                description: 'Allow researchers to contact you for follow-up assessments at 3 and 6 months.',
                required: false
            },
            sms: {
                title: 'SMS Notifications',
                description: 'Receive SMS reminders and motivational messages to support your learning journey.',
                required: false
            }
        },
        rights: {
            title: 'Your Rights',
            items: [
                'You can withdraw consent at any time without penalty',
                'You can request a copy of your data',
                'You can request deletion of your data',
                'Your participation is voluntary'
            ]
        },
        buttons: {
            agree: 'I Agree & Continue',
            decline: 'Decline',
            switchLang: 'Swahili'
        },
        errors: {
            required: 'Research data collection consent is required to participate',
            failed: 'Failed to submit consent. Please try again.'
        }
    },
    sw: {
        title: 'Idhini ya Kushiriki Utafiti',
        intro: 'Karibu kwenye Jukwaa la Ujuzi wa Kidijitali la SkillBridge. Jukwaa hili ni sehemu ya utafiti unaofanywa na Chuo Kikuu cha Mount Kenya kutathmini ufanisi wa mafunzo ya ujuzi wa kidijitali kwa vijana katika Jimbo la Kiharu.',
        dataProtection: 'Ushiriki wako unaongozwa na Sheria ya Ulinzi wa Data ya Kenya 2019. Data yako itashughulikiwa kwa usiri mkubwa.',
        sections: {
            research: {
                title: 'Ukusanyaji wa Data ya Utafiti',
                description: 'Ruhusu ukusanyaji wa maendeleo yako ya kujifunza, alama za tathmini, na matumizi ya jukwaa kwa uchambuzi wa utafiti.',
                required: true
            },
            sharing: {
                title: 'Kushiriki Data Isiyojulikana',
                description: 'Ruhusu kushiriki data isiyojulikana (isiyoweza kutambulika) katika machapisho ya kitaaluma na ripoti.',
                required: false
            },
            surveys: {
                title: 'Uchunguzi wa Athari za Kiuchumi',
                description: 'Shiriki katika uchunguzi wa ufuatiliaji kuhusu jinsi mafunzo yamekuathiri shughuli zako za kiuchumi.',
                required: false
            },
            contact: {
                title: 'Mawasiliano ya Ufuatiliaji',
                description: 'Ruhusu watafiti kukuwasiliana nawe kwa tathmini za ufuatiliaji baada ya miezi 3 na 6.',
                required: false
            },
            sms: {
                title: 'Arifa za SMS',
                description: 'Pokea vikumbusho vya SMS na ujumbe wa motisha kusaidia safari yako ya kujifunza.',
                required: false
            }
        },
        rights: {
            title: 'Haki Zako',
            items: [
                'Unaweza kuondoa idhini wakati wowote bila adhabu',
                'Unaweza kuomba nakala ya data yako',
                'Unaweza kuomba kufutwa kwa data yako',
                'Ushiriki wako ni wa hiari'
            ]
        },
        buttons: {
            agree: 'Nakubali & Endelea',
            decline: 'Kataa',
            switchLang: 'English'
        },
        errors: {
            required: 'Idhini ya ukusanyaji wa data ya utafiti inahitajika kushiriki',
            failed: 'Imeshindwa kuwasilisha idhini. Tafadhali jaribu tena.'
        }
    }
};

const ConsentModal = ({ show, onConsent, onDecline }) => {
    const [language, setLanguage] = useState('en');
    const [permissions, setPermissions] = useState({
        researchDataCollection: false,
        anonymizedDataSharing: false,
        economicSurveys: false,
        followUpContact: false,
        smsNotifications: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const content = consentContent[language];

    const handlePermissionChange = (key) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setError(null);
    };

    const handleSubmit = async () => {
        // Validate required permission
        if (!permissions.researchDataCollection) {
            setError(content.errors.required);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post('/consent', {
                permissions,
                language,
                method: 'click'
            });

            onConsent(permissions);
        } catch (err) {
            console.error('Consent submission error:', err);
            setError(content.errors.failed);
        } finally {
            setLoading(false);
        }
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'sw' : 'en');
    };

    return (
        <Modal
            show={show}
            onHide={() => { }}
            backdrop="static"
            keyboard={false}
            size="lg"
            centered
            className="consent-modal"
        >
            <Modal.Header className="consent-header">
                <Modal.Title>{content.title}</Modal.Title>
                <Button
                    variant="outline-light"
                    size="sm"
                    onClick={toggleLanguage}
                    className="lang-toggle"
                >
                    {content.buttons.switchLang}
                </Button>
            </Modal.Header>

            <Modal.Body className="consent-body">
                <p className="consent-intro">{content.intro}</p>

                <Alert variant="info" className="data-protection-notice">
                    <i className="bi bi-shield-check me-2"></i>
                    {content.dataProtection}
                </Alert>

                <div className="consent-sections">
                    {Object.entries(content.sections).map(([key, section]) => (
                        <div key={key} className="consent-section">
                            <Form.Check
                                type="checkbox"
                                id={`consent-${key}`}
                                checked={permissions[key === 'research' ? 'researchDataCollection' :
                                    key === 'sharing' ? 'anonymizedDataSharing' :
                                        key === 'surveys' ? 'economicSurveys' :
                                            key === 'contact' ? 'followUpContact' : 'smsNotifications']}
                                onChange={() => handlePermissionChange(
                                    key === 'research' ? 'researchDataCollection' :
                                        key === 'sharing' ? 'anonymizedDataSharing' :
                                            key === 'surveys' ? 'economicSurveys' :
                                                key === 'contact' ? 'followUpContact' : 'smsNotifications'
                                )}
                                label={
                                    <div className="consent-label">
                                        <strong>
                                            {section.title}
                                            {section.required && <span className="required-badge">*</span>}
                                        </strong>
                                        <p className="consent-description">{section.description}</p>
                                    </div>
                                }
                            />
                        </div>
                    ))}
                </div>

                <div className="rights-section">
                    <h6>{content.rights.title}</h6>
                    <ul>
                        {content.rights.items.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                {error && (
                    <Alert variant="danger" className="mt-3">
                        {error}
                    </Alert>
                )}
            </Modal.Body>

            <Modal.Footer className="consent-footer">
                <Button
                    variant="outline-secondary"
                    onClick={onDecline}
                    disabled={loading}
                >
                    {content.buttons.decline}
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Loading...
                        </>
                    ) : content.buttons.agree}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConsentModal;
