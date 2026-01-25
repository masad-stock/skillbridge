import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { KIHARU_LOCALIZATION, KIHARU_BUSINESS_PROFILES, KIHARU_NETWORK_PARTNERS } from '../data/kiharuContent';

const KiharuFeatures = () => {
  const { t, i18n } = useTranslation();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showPartners, setShowPartners] = useState(false);

  const isSwahili = i18n.language === 'sw';

  return (
    <div className="kiharu-features">
      {/* Kiharu Header */}
      <div className="kiharu-header bg-primary text-white p-4 rounded mb-4">
        <h2 className="h4 mb-2">
          {isSwahili ? KIHARU_LOCALIZATION.welcome : "Welcome to Kiharu Constituency"}
        </h2>
        <p className="mb-2">
          {isSwahili ? KIHARU_LOCALIZATION.description : "A specialized platform for Kiharu youth to learn digital skills and start businesses."}
        </p>
        <div className="row text-center">
          <div className="col-md-3">
            <div className="stat-item">
              <h4 className="h2 mb-0">{KIHARU_LOCALIZATION.population.split(':')[1].trim()}</h4>
              <small>{isSwahili ? "Idadi ya Watu" : "Population"}</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <h4 className="h2 mb-0">{KIHARU_LOCALIZATION.youth.split(':')[1].trim()}</h4>
              <small>{isSwahili ? "Vijana (18-35)" : "Youth (18-35)"}</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <h4 className="h2 mb-0">{KIHARU_LOCALIZATION.localBusinesses.length}</h4>
              <small>{isSwahili ? "Sekta za Biashara" : "Business Sectors"}</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-item">
              <h4 className="h2 mb-0">{KIHARU_NETWORK_PARTNERS.length}</h4>
              <small>{isSwahili ? "Washirika" : "Partners"}</small>
            </div>
          </div>
        </div>
      </div>

      {/* Local Challenges & Opportunities */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-warning">
              <h5 className="mb-0">
                {isSwahili ? "Changamoto za Kiharu" : "Kiharu Challenges"}
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                {KIHARU_LOCALIZATION.challenges.map((challenge, index) => (
                  <li key={index} className="mb-2">
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                    {isSwahili ? KIHARU_LOCALIZATION.challenges[challenge] || challenge : challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success">
              <h5 className="mb-0">
                {isSwahili ? "Fursa za Kiharu" : "Kiharu Opportunities"}
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                {KIHARU_LOCALIZATION.opportunities.map((opportunity, index) => (
                  <li key={index} className="mb-2">
                    <i className="fas fa-star text-success me-2"></i>
                    {isSwahili ? KIHARU_LOCALIZATION.opportunities[opportunity] || opportunity : opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Business Profiles */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isSwahili ? "Profaili za Biashara za Kiharu" : "Kiharu Business Profiles"}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            {KIHARU_BUSINESS_PROFILES.map((profile, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div
                  className={`card h-100 ${selectedProfile === index ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedProfile(selectedProfile === index ? null : index)}
                >
                  <div className="card-body">
                    <h6 className="card-title">{profile.type}</h6>
                    <div className="mb-2">
                      <small className="text-muted">
                        {isSwahili ? "Ujuzi Muhimu:" : "Key Skills:"}
                      </small>
                      <ul className="list-unstyled small mt-1">
                        {profile.skills.map((skill, skillIndex) => (
                          <li key={skillIndex}>
                            <i className="fas fa-check text-success me-1"></i>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedProfile === index && (
                      <div className="mt-3 pt-3 border-top">
                        <div className="mb-2">
                          <small className="text-muted">
                            {isSwahili ? "Changamoto:" : "Challenges:"}
                          </small>
                          <ul className="list-unstyled small">
                            {profile.challenges.map((challenge, challengeIndex) => (
                              <li key={challengeIndex}>
                                <i className="fas fa-exclamation-circle text-warning me-1"></i>
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <small className="text-muted">
                            {isSwahili ? "Fursa:" : "Opportunities:"}
                          </small>
                          <ul className="list-unstyled small">
                            {profile.opportunities.map((opportunity, opportunityIndex) => (
                              <li key={opportunityIndex}>
                                <i className="fas fa-lightbulb text-info me-1"></i>
                                {opportunity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isSwahili ? "Hadithi za Mafanikio" : "Success Stories"}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            {KIHARU_LOCALIZATION.successStories.map((story, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">{story.name}</h6>
                    <p className="card-text small mb-2">
                      <strong>{isSwahili ? "Biashara:" : "Business:"}</strong> {story.business}
                    </p>
                    <p className="card-text small mb-2">
                      <strong>{isSwahili ? "Athari:" : "Impact:"}</strong> {story.impact}
                    </p>
                    <p className="card-text small text-muted">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {story.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Partners */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {isSwahili ? "Washirika wa Mtandao" : "Network Partners"}
          </h5>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowPartners(!showPartners)}
          >
            {showPartners ? (isSwahili ? "Ficha" : "Hide") : (isSwahili ? "Onyesha" : "Show")}
          </button>
        </div>
        {showPartners && (
          <div className="card-body">
            <div className="row">
              {KIHARU_NETWORK_PARTNERS.map((partner, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">{partner.name}</h6>
                      <p className="card-text small mb-2">
                        <strong>{isSwahili ? "Aina:" : "Type:"}</strong> {partner.type}
                      </p>
                      <p className="card-text small mb-2">
                        <strong>{isSwahili ? "Huduma:" : "Services:"}</strong>
                      </p>
                      <ul className="list-unstyled small mb-3">
                        {partner.services.map((service, serviceIndex) => (
                          <li key={serviceIndex}>
                            <i className="fas fa-check text-success me-1"></i>
                            {service}
                          </li>
                        ))}
                      </ul>
                      <p className="card-text small">
                        <i className="fas fa-envelope me-1"></i>
                        {partner.contact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KiharuFeatures;
