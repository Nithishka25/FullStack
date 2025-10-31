import React, { useEffect, useState } from 'react';
import api from '../api.js';
import { useNavigate } from 'react-router-dom';

export default function Survey() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/questions/random?count=5');
        setQuestions(data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setAns = (qid, val) => setAnswers((s) => ({ ...s, [qid]: val }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = Object.entries(answers).map(([question, answer]) => ({ question, answer }));
      const { data } = await api.post('/api/responses', { answers: payload });
      navigate('/confirm', { state: { id: data.id } });
    } catch (e) {
      setError(e?.response?.data?.message || 'Submit failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
      {questions.map((q) => (
        <div key={q._id}>
          <div style={{ fontWeight: 'bold' }}>{q.text}</div>
          {q.type === 'text' && (
            <input value={answers[q._id] || ''} onChange={(e) => setAns(q._id, e.target.value)} />
          )}
          {q.type === 'single' && (
            <div>
              {q.options.map((opt, i) => (
                <label key={i} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={(e) => setAns(q._id, e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === 'multi' && (
            <div>
              {q.options.map((opt, i) => {
                const arr = Array.isArray(answers[q._id]) ? answers[q._id] : [];
                const checked = arr.includes(opt);
                return (
                  <label key={i} style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(arr);
                        if (e.target.checked) next.add(opt);
                        else next.delete(opt);
                        setAns(q._id, Array.from(next));
                      }}
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}
