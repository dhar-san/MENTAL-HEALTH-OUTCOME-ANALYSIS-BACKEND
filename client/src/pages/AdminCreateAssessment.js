/**
 * Admin Create/Edit Assessment - Add questions with score values
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AdminCreateAssessment.css';

const TYPES = ['stress', 'anxiety', 'depression', 'general'];
const DEFAULT_RULES = [
  { level: 'Low', minScore: 0, maxScore: 5 },
  { level: 'Moderate', minScore: 6, maxScore: 10 },
  { level: 'Severe', minScore: 11, maxScore: 15 },
];

export default function AdminCreateAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('stress');
  const [questions, setQuestions] = useState([
    { questionText: '', options: [{ text: '', score: 0 }], order: 0 },
  ]);
  const [scoringRules, setScoringRules] = useState(DEFAULT_RULES);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(`/assessments/${id}`);
        const a = data.assessment;
        setTitle(a.title || '');
        setDescription(a.description || '');
        setType(a.type || 'stress');
        setQuestions(
          (a.questions || []).length > 0
            ? a.questions.map((q) => ({
                questionText: q.questionText,
                options: (q.options || []).map((o) => ({ text: o.text, score: o.score })),
                order: q.order,
              }))
            : [{ questionText: '', options: [{ text: '', score: 0 }], order: 0 }]
        );
        setScoringRules(a.scoringRules?.length ? a.scoringRules : DEFAULT_RULES);
      } catch (e) {
        setError('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isEdit]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionText: '', options: [{ text: '', score: 0 }], order: prev.length },
    ]);
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) => {
      const q = [...prev];
      q[idx] = { ...q[idx], [field]: value };
      return q;
    });
  };

  const addOption = (qIdx) => {
    setQuestions((prev) => {
      const q = [...prev];
      q[qIdx].options = [...(q[qIdx].options || []), { text: '', score: 0 }];
      return q;
    });
  };

  const updateOption = (qIdx, optIdx, field, value) => {
    setQuestions((prev) => {
      const q = [...prev];
      q[qIdx].options[optIdx] = {
        ...q[qIdx].options[optIdx],
        [field]: field === 'score' ? Number(value) : value,
      };
      return q;
    });
  };

  const removeQuestion = (qIdx) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx));
  };

  const removeOption = (qIdx, optIdx) => {
    const q = questions[qIdx];
    if (q.options.length <= 1) return;
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options = copy[qIdx].options.filter((_, i) => i !== optIdx);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title,
      description,
      type,
      questions: questions
        .filter((q) => q.questionText.trim())
        .map((q, i) => ({
          questionText: q.questionText,
          options: (q.options || []).filter((o) => o.text.trim()).map((o) => ({
            text: o.text,
            score: Number(o.score) || 0,
          })),
          order: i,
        })),
      scoringRules,
    };

    if (payload.questions.length < 1) {
      setError('Add at least one question with options');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/assessments/${id}`, payload);
      } else {
        await api.post('/assessments', payload);
      }
      navigate('/admin/assessments');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-create-assessment">
      <h1>{isEdit ? 'Edit Assessment' : 'Create Assessment'}</h1>
      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Info</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Stress Assessment"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the assessment"
              rows={2}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>Questions</h2>
            <button type="button" className="btn-add" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="question-editor">
              <div className="question-header">
                <span>Question {qIdx + 1}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeQuestion(qIdx)}
                  disabled={questions.length <= 1}
                >
                  Remove
                </button>
              </div>
              <input
                className="question-input"
                value={q.questionText}
                onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                placeholder="Question text"
              />
              <div className="options-editor">
                {(q.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="option-row">
                    <input
                      value={opt.text}
                      onChange={(e) => updateOption(qIdx, optIdx, 'text', e.target.value)}
                      placeholder="Option text"
                    />
                    <input
                      type="number"
                      value={opt.score}
                      onChange={(e) => updateOption(qIdx, optIdx, 'score', e.target.value)}
                      placeholder="Score"
                      style={{ width: 70 }}
                    />
                    <button
                      type="button"
                      className="btn-remove-sm"
                      onClick={() => removeOption(qIdx, optIdx)}
                      disabled={(q.options || []).length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-add-opt"
                  onClick={() => addOption(qIdx)}
                >
                  + Add Option
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <h2>Scoring Rules (Severity Levels)</h2>
          <p className="hint">Score ranges determine Low, Moderate, Severe classification</p>
          {scoringRules.map((r, idx) => (
            <div key={idx} className="rule-row">
              <span>{r.level}</span>
              <input
                type="number"
                value={r.minScore}
                onChange={(e) => {
                  const copy = [...scoringRules];
                  copy[idx] = { ...copy[idx], minScore: Number(e.target.value) };
                  setScoringRules(copy);
                }}
              />
              <span>-</span>
              <input
                type="number"
                value={r.maxScore}
                onChange={(e) => {
                  const copy = [...scoringRules];
                  copy[idx] = { ...copy[idx], maxScore: Number(e.target.value) };
                  setScoringRules(copy);
                }}
              />
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/assessments')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
