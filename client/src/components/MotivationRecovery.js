/**
 * Motivation & Recovery Module
 * Displays motivational content, certificate, and wellness recommendations
 * based on mental health classification (Low/Moderate/Severe)
 */
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MOTIVATION_DATA } from '../data/motivationData';
import './MotivationRecovery.css';

export default function MotivationRecovery({ result, assessmentTitle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const certificateRef = useRef(null);

  const severity = result?.severityLevel || result?.severity || 'Moderate';
  const data = MOTIVATION_DATA[severity] || MOTIVATION_DATA.Moderate;
  const userName = user?.name || 'Valued User';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      pdf.save(`Wellness-Certificate-${userName.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Certificate download failed:', err);
    }
  };

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `Wellness-Certificate-${userName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image download failed:', err);
    }
  };

  return (
    <div className="motivation-recovery">
      <div className="motivation-header">
        <h1>Motivation & Recovery</h1>
        <p className="motivation-subtitle">
          Your personalized wellness guide and recognition
        </p>
      </div>

      <section className="motivation-message-section">
        <div className="message-card">
          <h2>Your Motivational Message</h2>
          <p className="motivational-text">{data.motivationalMessage}</p>
          {data.professionalNote && (
            <p className="professional-note">{data.professionalNote}</p>
          )}
        </div>
      </section>

      <section className="certificate-section">
        <h2>Your Certificate</h2>
        <div className="certificate-preview-wrap">
          <div ref={certificateRef} className="certificate-preview">
            <div className="certificate-inner">
              <div className="certificate-border">
                <h3 className="certificate-title">{data.certificateTitle}</h3>
                <p className="certificate-awarded">This certificate is presented to</p>
                <p className="certificate-name">{userName}</p>
                <p className="certificate-status">
                  In recognition of completing a mental wellness assessment
                  <br />
                  <strong>Status: {data.displayName}</strong>
                </p>
                <p className="certificate-date">{dateStr}</p>
                <p className="certificate-message">{data.motivationalMessage}</p>
                <p className="certificate-disclaimer">
                  This is for awareness and wellness guidance only, not a medical diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="certificate-actions">
          <button className="btn-download" onClick={handleDownloadPDF}>
            Download as PDF
          </button>
          <button className="btn-download btn-secondary" onClick={handleDownloadImage}>
            Download as Image
          </button>
        </div>
      </section>

      <section className="recommendations-section">
        <h2>Personalized Wellness Recommendations</h2>
        <div className="recommendations-grid">
          <div className="rec-card physical">
            <h3>Physical Activities</h3>
            <ul>
              {data.physical.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rec-card mental">
            <h3>Mental & Emotional Practices</h3>
            <ul>
              {data.mental.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rec-card nutritional">
            <h3>Nutritional Suggestions</h3>
            <ul>
              {data.nutritional.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="motivation-actions">
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
        {result && (
          <button className="btn-secondary" onClick={() => navigate('/assessments')}>
            Take Another Assessment
          </button>
        )}
      </div>
    </div>
  );
}
