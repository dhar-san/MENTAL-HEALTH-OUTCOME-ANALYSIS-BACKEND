/**
 * Take Assessment - Complete questions and submit response
 * Automatically calculates score and categorizes severity
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import MotivationRecovery from '../components/MotivationRecovery';
import './TakeAssessment.css';

export default function TakeAssessment() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/assessments/${id}`);
        setAssessment(data.assessment);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAnswer = (qIdx, optIdx) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const questions = assessment?.questions || [];
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const answerArray = questions.map((_, qIdx) => ({
        questionIndex: qIdx,
        selectedOptionIndex: answers[qIdx],
      }));
      const { data } = await api.post('/responses', {
        assessmentId: id,
        answers: answerArray,
      });
      setResult(data.response);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading assessment...</div>;
  if (!assessment) return <div className="error-msg">{error || 'Assessment not found'}</div>;

  if (result) {
    return (
      <MotivationRecovery
        result={result}
        assessmentTitle={assessment?.title}
      />
    );
  }

  const questions = assessment.questions || [];
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="take-assessment">
      <h1>{assessment.title}</h1>
      {assessment.description && <p className="desc">{assessment.description}</p>}
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="questions">
          {questions
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((q, qIdx) => (
              <div key={qIdx} className="question-block">
                <h3>
                  {qIdx + 1}. {q.questionText}
                </h3>
                <div className="options">
                  {(q.options || []).map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className={`option ${answers[qIdx] === optIdx ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q${qIdx}`}
                        checked={answers[qIdx] === optIdx}
                        onChange={() => handleAnswer(qIdx, optIdx)}
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="submit-row">
          <button
            type="submit"
            className="btn-primary"
            disabled={!allAnswered || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}
