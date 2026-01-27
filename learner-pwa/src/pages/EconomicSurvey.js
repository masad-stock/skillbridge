import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './EconomicSurvey.css';

const EconomicSurvey = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const surveyType = searchParams.get('type') || 'baseline';

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [existingSurvey, setExistingSurvey] = useState(null);

    const [formData, setFormData] = useState({
        surveyType,
        employment: {
            status: '',
            sector: '',
            hoursPerWeek: '',
            jobTitle: '',
            employerType: ''
        },
        income: {
            range: '',
            currency: 'KES',
            sources: []
        },
        business: {
            hasBusiness: false,
            type: '',
            monthlyRevenue: '',
            employeesCount: '',
            yearsInOperation: '',
            registrationStatus: ''
        },
        digitalSkillsApplication: {
            usesDigitalPayments: false,
            paymentMethods: [],
            hasOnlinePresence: false,
            onlineChannels: [],
            usesBusinessSoftware: false,
            softwareUsed: [],
            sellsOnline: false,
            onlineSalesPercentage: ''
        },
        skillsGained: [],
        platformImpact: {
            helpedFindJob: false,
            helpedStartBusiness: false,
            helpedGrowBusiness: false,
            helpedIncreaseIncome: false,
            incomeIncreasePercentage: '',
            overallSatisfaction: 3,
            wouldRecommend: true,
            testimonial: ''
        },
        challenges: []
    });

    const totalSteps = 6;

    useEffect(() => {
        loadExistingSurvey();
    }, [surveyType]);

    const loadExistingSurvey = async () => {
        try {
            const response = await api.get(`/api/economic-survey/${surveyType}`);
            if (response.data.success && response.data.data) {
                setExistingSurvey(response.data.data);
                setFormData(response.data.data);
            }
        } catch (error) {
            // Survey doesn't exist yet, that's okay
            console.log('No existing survey found');
        }
    };

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleArrayToggle = (section, field, value) => {
        setFormData(prev => {
            const currentArray = prev[section][field] || [];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];

            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: newArray
                }
            };
        });
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/api/economic-survey', formData);

            if (response.data.success) {
                alert('Survey submitted successfully! Thank you for your participation.');
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error submitting survey');
        } finally {
            setLoading(false);
        }
    };

    const getSurveyTitle = () => {
        const titles = {
            baseline: 'Baseline Economic Survey',
            followup_3m: '3-Month Follow-up Survey',
            followup_6m: '6-Month Follow-up Survey',
            followup_12m: '12-Month Follow-up Survey'
        };
        return titles[surveyType] || 'Economic Survey';
    };

    const renderStep1 = () => (
        <div className="survey-step">
            <h3>Employment Information</h3>

            <div className="form-group">
                <label>Current Employment Status *</label>
                <select
                    value={formData.employment.status}
                    onChange={(e) => handleInputChange('employment', 'status', e.target.value)}
                    required
                >
                    <option value="">Select status</option>
                    <option value="employed">Employed</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="student">Student</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {(formData.employment.status === 'employed' || formData.employment.status === 'self_employed') && (
                <>
                    <div className="form-group">
                        <label>Job Title / Role</label>
                        <input
                            type="text"
                            value={formData.employment.jobTitle}
                            onChange={(e) => handleInputChange('employment', 'jobTitle', e.target.value)}
                            placeholder="e.g., Sales Assistant, Business Owner"
                        />
                    </div>

                    <div className="form-group">
                        <label>Sector / Industry</label>
                        <input
                            type="text"
                            value={formData.employment.sector}
                            onChange={(e) => handleInputChange('employment', 'sector', e.target.value)}
                            placeholder="e.g., Retail, Agriculture, Technology"
                        />
                    </div>

                    <div className="form-group">
                        <label>Hours Worked Per Week</label>
                        <input
                            type="number"
                            value={formData.employment.hoursPerWeek}
                            onChange={(e) => handleInputChange('employment', 'hoursPerWeek', e.target.value)}
                            min="0"
                            max="168"
                        />
                    </div>

                    {formData.employment.status === 'employed' && (
                        <div className="form-group">
                            <label>Employer Type</label>
                            <select
                                value={formData.employment.employerType}
                                onChange={(e) => handleInputChange('employment', 'employerType', e.target.value)}
                            >
                                <option value="">Select type</option>
                                <option value="private">Private Company</option>
                                <option value="government">Government</option>
                                <option value="ngo">NGO</option>
                                <option value="self">Self-Employed</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="survey-step">
            <h3>Income Information</h3>

            <div className="form-group">
                <label>Monthly Income Range (KES) *</label>
                <select
                    value={formData.income.range}
                    onChange={(e) => handleInputChange('income', 'range', e.target.value)}
                    required
                >
                    <option value="">Select range</option>
                    <option value="below_5k">Below KES 5,000</option>
                    <option value="5k_10k">KES 5,000 - 10,000</option>
                    <option value="10k_20k">KES 10,000 - 20,000</option>
                    <option value="20k_30k">KES 20,000 - 30,000</option>
                    <option value="30k_50k">KES 30,000 - 50,000</option>
                    <option value="50k_100k">KES 50,000 - 100,000</option>
                    <option value="above_100k">Above KES 100,000</option>
                    <option value="prefer_not_say">Prefer not to say</option>
                </select>
            </div>

            <div className="form-group">
                <label>Income Sources (Select all that apply)</label>
                <div className="checkbox-group">
                    {['salary', 'business', 'freelance', 'farming', 'remittances', 'other'].map(source => (
                        <label key={source} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.income.sources.includes(source)}
                                onChange={() => handleArrayToggle('income', 'sources', source)}
                            />
                            {source.charAt(0).toUpperCase() + source.slice(1)}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="survey-step">
            <h3>Business Information</h3>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={formData.business.hasBusiness}
                        onChange={(e) => handleInputChange('business', 'hasBusiness', e.target.checked)}
                    />
                    I own or operate a business
                </label>
            </div>

            {formData.business.hasBusiness && (
                <>
                    <div className="form-group">
                        <label>Type of Business</label>
                        <input
                            type="text"
                            value={formData.business.type}
                            onChange={(e) => handleInputChange('business', 'type', e.target.value)}
                            placeholder="e.g., Retail Shop, Food Vendor, Services"
                        />
                    </div>

                    <div className="form-group">
                        <label>Monthly Business Revenue (KES)</label>
                        <select
                            value={formData.business.monthlyRevenue}
                            onChange={(e) => handleInputChange('business', 'monthlyRevenue', e.target.value)}
                        >
                            <option value="">Select range</option>
                            <option value="below_10k">Below KES 10,000</option>
                            <option value="10k_30k">KES 10,000 - 30,000</option>
                            <option value="30k_50k">KES 30,000 - 50,000</option>
                            <option value="50k_100k">KES 50,000 - 100,000</option>
                            <option value="100k_500k">KES 100,000 - 500,000</option>
                            <option value="above_500k">Above KES 500,000</option>
                            <option value="prefer_not_say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Employees (including yourself)</label>
                        <input
                            type="number"
                            value={formData.business.employeesCount}
                            onChange={(e) => handleInputChange('business', 'employeesCount', e.target.value)}
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label>Years in Operation</label>
                        <input
                            type="number"
                            value={formData.business.yearsInOperation}
                            onChange={(e) => handleInputChange('business', 'yearsInOperation', e.target.value)}
                            min="0"
                            step="0.5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Business Registration Status</label>
                        <select
                            value={formData.business.registrationStatus}
                            onChange={(e) => handleInputChange('business', 'registrationStatus', e.target.value)}
                        >
                            <option value="">Select status</option>
                            <option value="registered">Registered</option>
                            <option value="unregistered">Not Registered</option>
                            <option value="in_progress">Registration in Progress</option>
                        </select>
                    </div>
                </>
            )}
        </div>
    );

    const renderStep4 = () => (
        <div className="survey-step">
            <h3>Digital Skills Application</h3>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={formData.digitalSkillsApplication.usesDigitalPayments}
                        onChange={(e) => handleInputChange('digitalSkillsApplication', 'usesDigitalPayments', e.target.checked)}
                    />
                    I use digital payment methods
                </label>
            </div>

            {formData.digitalSkillsApplication.usesDigitalPayments && (
                <div className="form-group">
                    <label>Payment Methods Used (Select all that apply)</label>
                    <div className="checkbox-group">
                        {['mpesa', 'bank_transfer', 'card', 'paypal', 'other'].map(method => (
                            <label key={method} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.digitalSkillsApplication.paymentMethods.includes(method)}
                                    onChange={() => handleArrayToggle('digitalSkillsApplication', 'paymentMethods', method)}
                                />
                                {method === 'mpesa' ? 'M-Pesa' : method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={formData.digitalSkillsApplication.hasOnlinePresence}
                        onChange={(e) => handleInputChange('digitalSkillsApplication', 'hasOnlinePresence', e.target.checked)}
                    />
                    I have an online presence for my work/business
                </label>
            </div>

            {formData.digitalSkillsApplication.hasOnlinePresence && (
                <div className="form-group">
                    <label>Online Channels Used (Select all that apply)</label>
                    <div className="checkbox-group">
                        {['facebook', 'instagram', 'whatsapp', 'website', 'tiktok', 'other'].map(channel => (
                            <label key={channel} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.digitalSkillsApplication.onlineChannels.includes(channel)}
                                    onChange={() => handleArrayToggle('digitalSkillsApplication', 'onlineChannels', channel)}
                                />
                                {channel.charAt(0).toUpperCase() + channel.slice(1)}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={formData.digitalSkillsApplication.sellsOnline}
                        onChange={(e) => handleInputChange('digitalSkillsApplication', 'sellsOnline', e.target.checked)}
                    />
                    I sell products/services online
                </label>
            </div>

            {formData.digitalSkillsApplication.sellsOnline && (
                <div className="form-group">
                    <label>Percentage of Sales from Online Channels</label>
                    <input
                        type="number"
                        value={formData.digitalSkillsApplication.onlineSalesPercentage}
                        onChange={(e) => handleInputChange('digitalSkillsApplication', 'onlineSalesPercentage', e.target.value)}
                        min="0"
                        max="100"
                        placeholder="0-100%"
                    />
                </div>
            )}
        </div>
    );

    const renderStep5 = () => (
        <div className="survey-step">
            <h3>Platform Impact</h3>

            {surveyType !== 'baseline' && (
                <>
                    <p className="info-text">
                        Please indicate how the learning platform has impacted your economic situation:
                    </p>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.platformImpact.helpedFindJob}
                                onChange={(e) => handleInputChange('platformImpact', 'helpedFindJob', e.target.checked)}
                            />
                            Helped me find employment
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.platformImpact.helpedStartBusiness}
                                onChange={(e) => handleInputChange('platformImpact', 'helpedStartBusiness', e.target.checked)}
                            />
                            Helped me start a business
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.platformImpact.helpedGrowBusiness}
                                onChange={(e) => handleInputChange('platformImpact', 'helpedGrowBusiness', e.target.checked)}
                            />
                            Helped me grow my existing business
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.platformImpact.helpedIncreaseIncome}
                                onChange={(e) => handleInputChange('platformImpact', 'helpedIncreaseIncome', e.target.checked)}
                            />
                            Helped me increase my income
                        </label>
                    </div>

                    {formData.platformImpact.helpedIncreaseIncome && (
                        <div className="form-group">
                            <label>Estimated Income Increase (%)</label>
                            <input
                                type="number"
                                value={formData.platformImpact.incomeIncreasePercentage}
                                onChange={(e) => handleInputChange('platformImpact', 'incomeIncreasePercentage', e.target.value)}
                                min="0"
                                max="1000"
                                placeholder="e.g., 25 for 25% increase"
                            />
                        </div>
                    )}
                </>
            )}

            <div className="form-group">
                <label>Overall Satisfaction with Platform (1-5)</label>
                <div className="rating-group">
                    {[1, 2, 3, 4, 5].map(rating => (
                        <label key={rating} className="rating-label">
                            <input
                                type="radio"
                                name="satisfaction"
                                value={rating}
                                checked={formData.platformImpact.overallSatisfaction === rating}
                                onChange={() => handleInputChange('platformImpact', 'overallSatisfaction', rating)}
                            />
                            <span>{rating}</span>
                        </label>
                    ))}
                </div>
                <small>1 = Very Dissatisfied, 5 = Very Satisfied</small>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={formData.platformImpact.wouldRecommend}
                        onChange={(e) => handleInputChange('platformImpact', 'wouldRecommend', e.target.checked)}
                    />
                    I would recommend this platform to others
                </label>
            </div>

            <div className="form-group">
                <label>Success Story / Testimonial (Optional)</label>
                <textarea
                    value={formData.platformImpact.testimonial}
                    onChange={(e) => handleInputChange('platformImpact', 'testimonial', e.target.value)}
                    rows="4"
                    placeholder="Share your experience and how the platform has helped you..."
                />
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="survey-step">
            <h3>Challenges & Feedback</h3>

            <div className="form-group">
                <label>Challenges Faced (Select all that apply)</label>
                <div className="checkbox-group">
                    {[
                        { value: 'internet_access', label: 'Internet Access' },
                        { value: 'device_access', label: 'Device Access' },
                        { value: 'time_constraints', label: 'Time Constraints' },
                        { value: 'language_barrier', label: 'Language Barrier' },
                        { value: 'content_difficulty', label: 'Content Difficulty' },
                        { value: 'technical_issues', label: 'Technical Issues' },
                        { value: 'other', label: 'Other' }
                    ].map(challenge => (
                        <label key={challenge.value} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.challenges.includes(challenge.value)}
                                onChange={() => {
                                    const newChallenges = formData.challenges.includes(challenge.value)
                                        ? formData.challenges.filter(c => c !== challenge.value)
                                        : [...formData.challenges, challenge.value];
                                    setFormData(prev => ({ ...prev, challenges: newChallenges }));
                                }}
                            />
                            {challenge.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="survey-summary">
                <h4>Survey Summary</h4>
                <p>Please review your responses before submitting.</p>
                <ul>
                    <li>Employment Status: {formData.employment.status || 'Not specified'}</li>
                    <li>Income Range: {formData.income.range || 'Not specified'}</li>
                    <li>Has Business: {formData.business.hasBusiness ? 'Yes' : 'No'}</li>
                    <li>Uses Digital Payments: {formData.digitalSkillsApplication.usesDigitalPayments ? 'Yes' : 'No'}</li>
                    <li>Overall Satisfaction: {formData.platformImpact.overallSatisfaction}/5</li>
                </ul>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5();
            case 6: return renderStep6();
            default: return null;
        }
    };

    return (
        <div className="economic-survey-container">
            <div className="survey-header">
                <h2>{getSurveyTitle()}</h2>
                <p className="survey-description">
                    This survey helps us understand the economic impact of the learning platform.
                    Your responses are confidential and will be used for research purposes only.
                </p>
            </div>

            <div className="survey-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
                <p className="progress-text">Step {currentStep} of {totalSteps}</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="survey-form">
                {renderCurrentStep()}

                <div className="survey-navigation">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="btn btn-secondary"
                        >
                            Previous
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="btn btn-primary"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Survey'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EconomicSurvey;
