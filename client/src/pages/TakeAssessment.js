/**
 * Take Assessment - Complete questions and submit response
 * Automatically calculates score and categorizes severity
 * Supports option shuffle and progress tracking
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import MotivationRecovery from '../components/MotivationRecovery';
import './TakeAssessment.css';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TakeAssessment() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [shuffleMap, setShuffleMap] = useState({}); // qIdx -> [original indices in shuffled order]

  const questions = useMemo(() => {
    if (!assessment?.questions) return [];
    return [...assessment.questions].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [assessment]);

  const [questionsWithShuffledOptions, setQuestionsWithShuffledOptions] = useState([]);

  useEffect(() => {
    if (questions.length === 0) return;
    const withShuffle = questions.map((q) => {
      const opts = q.options || [];
      const indices = opts.map((_, i) => i);
      const shuffledIndices = shuffleArray(indices);
      return {
        ...q,
        shuffledOptions: shuffledIndices.map((i) => ({ ...opts[i], _originalIndex: i })),
      };
    });
    setQuestionsWithShuffledOptions(withShuffle);
    const map = {};
    withShuffle.forEach((q, qIdx) => {
      map[qIdx] = q.shuffledOptions.map((o) => o._originalIndex);
    });
    setShuffleMap(map);
  }, [assessment?._id]);

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

  const handleAnswer = (qIdx, shuffledOptIdx) => {
    const originalIdx = shuffleMap[qIdx]?.[shuffledOptIdx] ?? shuffledOptIdx;
    setAnswers((prev) => ({ ...prev, [qIdx]: originalIdx }));
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

  const allAnswered = Object.keys(answers).length === questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="take-assessment">
      <h1>{assessment.title}</h1>
      {assessment.description && <p className="desc">{assessment.description}</p>}

      <div className="progress-tracker">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="progress-text">Question {answeredCount} of {questions.length} answered</span>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="questions">
          {(questionsWithShuffledOptions.length > 0 ? questionsWithShuffledOptions : questions).map((q, qIdx) => (
            <div key={qIdx} className="question-block">
              <h3>
                {qIdx + 1}. {q.questionText}
              </h3>
              <div className="options">
                {(q.shuffledOptions || q.options || []).map((opt, optIdx) => {
                  const originalIdx = opt._originalIndex ?? optIdx;
                  const isSelected = answers[qIdx] === originalIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q${qIdx}`}
                        checked={isSelected}
                        onChange={() => handleAnswer(qIdx, optIdx)}
                      />
                      <span>{opt.text}</span>
                    </label>
                  );
                })}
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
