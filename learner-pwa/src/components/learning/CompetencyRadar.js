import React, { useEffect, useRef } from 'react';
import './CompetencyRadar.css';

const CompetencyRadar = ({ competencies, size = 400 }) => {
    const canvasRef = useRef(null);

    const domainLabels = {
        basicDigitalLiteracy: 'Basic Digital Literacy',
        digitalCommunication: 'Digital Communication',
        eCommerce: 'E-Commerce',
        digitalFinancialServices: 'Digital Finance',
        businessAutomation: 'Business Automation',
        digitalMarketing: 'Digital Marketing',
        dataManagement: 'Data Management'
    };

    const levelColors = {
        beginner: '#e74c3c',
        intermediate: '#f39c12',
        advanced: '#3498db',
        expert: '#2ecc71'
    };

    useEffect(() => {
        if (!competencies || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const centerX = size / 2;
        const centerY = size / 2;
        const maxRadius = (size / 2) - 60;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Get domain data
        const domains = Object.keys(competencies).map(key => ({
            name: domainLabels[key] || key,
            score: competencies[key]?.score || 0,
            level: competencies[key]?.level || 'beginner'
        }));

        const numDomains = domains.length;
        const angleStep = (Math.PI * 2) / numDomains;

        // Draw background circles
        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 1;
        [0.25, 0.5, 0.75, 1].forEach(ratio => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw axes and labels
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        domains.forEach((domain, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;

            // Draw axis line
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw label
            const labelX = centerX + Math.cos(angle) * (maxRadius + 30);
            const labelY = centerY + Math.sin(angle) * (maxRadius + 30);

            // Wrap text if too long
            const words = domain.name.split(' ');
            if (words.length > 2) {
                ctx.fillText(words.slice(0, 2).join(' '), labelX, labelY - 6);
                ctx.fillText(words.slice(2).join(' '), labelX, labelY + 6);
            } else {
                ctx.fillText(domain.name, labelX, labelY);
            }
        });

        // Draw competency polygon
        ctx.beginPath();
        domains.forEach((domain, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const radius = (domain.score / 100) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();

        // Fill with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
        gradient.addColorStop(1, 'rgba(52, 152, 219, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke the polygon
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw points
        domains.forEach((domain, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const radius = (domain.score / 100) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = levelColors[domain.level];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw center point
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();

    }, [competencies, size]);

    if (!competencies) {
        return (
            <div className="competency-radar-placeholder">
                <p>No competency data available</p>
            </div>
        );
    }

    return (
        <div className="competency-radar-container">
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                className="competency-radar-canvas"
            />
            <div className="competency-legend">
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: levelColors.beginner }}></span>
                    <span>Beginner (0-39)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: levelColors.intermediate }}></span>
                    <span>Intermediate (40-69)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: levelColors.advanced }}></span>
                    <span>Advanced (70-89)</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: levelColors.expert }}></span>
                    <span>Expert (90-100)</span>
                </div>
            </div>
        </div>
    );
};

export default CompetencyRadar;
