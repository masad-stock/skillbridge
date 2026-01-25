/**
 * Step Wizard Component
 * Converts complex tasks into step-by-step wizards
 * Designed for users with limited digital experience
 */

import React, { useState, useCallback } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useSimplifiedMode, VisualProgress, SimplifiedButton, SimplifiedError } from './SimplifiedLayout';
import './StepWizard.css';

const StepWizard = ({
    steps,
    onComplete,
    onCancel,
    title,
    titleSw,
    allowSkip = false,
    showProgress = true
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [stepData, setStepData] = useState({});
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { language } = useSimplifiedMode();

    const currentStepConfig = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    const handleNext = useCallback(async () => {
        setError(null);

        // Validate current step if validation function provided
        if (currentStepConfig.validate) {
            const validationResult = currentStepConfig.validate(stepData[currentStep]);
            if (!validationResult.valid) {
                setError(validationResult.error);
                return;
            }
        }

        if (isLastStep) {
            // Complete wizard
            setIsSubmitting(true);
            try {
                await onComplete(stepData);
            } catch (err) {
                setError(language === 'sw'
                    ? 'Imeshindwa kukamilisha. Tafadhali jaribu tena.'
                    : 'Failed to complete. Please try again.'
                );
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, currentStepConfig, isLastStep, onComplete, stepData, language]);

    const handleBack = useCallback(() => {
        setError(null);
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    }, [isFirstStep]);

    const handleSkip = useCallback(() => {
        if (!isLastStep) {
            setCurrentStep(prev => prev + 1);
        }
    }, [isLastStep]);

    const updateStepData = useCallback((data) => {
        setStepData(prev => ({
            ...prev,
            [currentStep]: data
        }));
        setError(null);
    }, [currentStep]);

    const StepComponent = currentStepConfig.component;

    return (
        <div className="step-wizard">
            {/* Header */}
            <div className="wizard-header">
                <h2 className="wizard-title">
                    {language === 'sw' ? titleSw || title : title}
                </h2>
                {showProgress && (
                    <VisualProgress
                        current={currentStep}
                        total={steps.length}
                        labels={steps.map(s => language === 'sw' ? s.labelSw || s.label : s.label)}
                    />
                )}
            </div>

            {/* Step Content */}
            <div className="wizard-content">
                <div className="step-header">
                    <span className="step-icon">{currentStepConfig.icon}</span>
                    <h3 className="step-title">
                        {language === 'sw'
                            ? currentStepConfig.titleSw || currentStepConfig.title
                            : currentStepConfig.title
                        }
                    </h3>
                </div>

                {currentStepConfig.description && (
                    <p className="step-description">
                        {language === 'sw'
                            ? currentStepConfig.descriptionSw || currentStepConfig.description
                            : currentStepConfig.description
                        }
                    </p>
                )}

                <div className="step-component">
                    <StepComponent
                        data={stepData[currentStep]}
                        onChange={updateStepData}
                        language={language}
                    />
                </div>

                {error && (
                    <SimplifiedError
                        message={error}
                        onRetry={() => setError(null)}
                    />
                )}
            </div>

            {/* Navigation */}
            <div className="wizard-navigation">
                <div className="nav-left">
                    {!isFirstStep && (
                        <SimplifiedButton
                            variant="outline-secondary"
                            onClick={handleBack}
                            icon="⬅️"
                        >
                            {language === 'sw' ? 'Rudi' : 'Back'}
                        </SimplifiedButton>
                    )}
                    {isFirstStep && onCancel && (
                        <SimplifiedButton
                            variant="outline-danger"
                            onClick={onCancel}
                            icon="✖️"
                        >
                            {language === 'sw' ? 'Ghairi' : 'Cancel'}
                        </SimplifiedButton>
                    )}
                </div>

                <div className="nav-right">
                    {allowSkip && !isLastStep && currentStepConfig.optional && (
                        <SimplifiedButton
                            variant="outline-secondary"
                            onClick={handleSkip}
                        >
                            {language === 'sw' ? 'Ruka' : 'Skip'}
                        </SimplifiedButton>
                    )}
                    <SimplifiedButton
                        variant="primary"
                        onClick={handleNext}
                        icon={isLastStep ? '✓' : '➡️'}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? (language === 'sw' ? 'Inaendelea...' : 'Processing...')
                            : isLastStep
                                ? (language === 'sw' ? 'Kamilisha' : 'Complete')
                                : (language === 'sw' ? 'Endelea' : 'Next')
                        }
                    </SimplifiedButton>
                </div>
            </div>
        </div>
    );
};

// Example step components for common use cases

export const TextInputStep = ({ data, onChange, language, placeholder, placeholderSw }) => (
    <div className="text-input-step">
        <input
            type="text"
            className="simplified-input"
            value={data || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={language === 'sw' ? placeholderSw || placeholder : placeholder}
        />
    </div>
);

export const SelectionStep = ({ data, onChange, language, options }) => (
    <div className="selection-step">
        {options.map((option, index) => (
            <button
                key={index}
                className={`selection-option ${data === option.value ? 'selected' : ''}`}
                onClick={() => onChange(option.value)}
            >
                {option.icon && <span className="option-icon">{option.icon}</span>}
                <span className="option-label">
                    {language === 'sw' ? option.labelSw || option.label : option.label}
                </span>
                {data === option.value && <span className="check-mark">✓</span>}
            </button>
        ))}
    </div>
);

export const ConfirmationStep = ({ data, onChange, language, message, messageSw }) => (
    <div className="confirmation-step">
        <div className="confirmation-icon">📋</div>
        <p className="confirmation-message">
            {language === 'sw' ? messageSw || message : message}
        </p>
        <div className="confirmation-actions">
            <button
                className={`confirm-btn ${data === true ? 'selected' : ''}`}
                onClick={() => onChange(true)}
            >
                ✓ {language === 'sw' ? 'Ndio' : 'Yes'}
            </button>
            <button
                className={`confirm-btn ${data === false ? 'selected' : ''}`}
                onClick={() => onChange(false)}
            >
                ✖ {language === 'sw' ? 'Hapana' : 'No'}
            </button>
        </div>
    </div>
);

export default StepWizard;
