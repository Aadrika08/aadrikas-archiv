import { useCallback, useMemo, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { actions } from 'astro:actions';
import type { GuestbookEntry } from '@/lib/server/supabase';
import TurnstileWidget from './TurnstileWidget';

interface Props {
  entries: GuestbookEntry[];
  siteKey: string;
}

type Edge = { id: string; x1: number; y1: number; x2: number; y2: number };

function buildEdges(entries: GuestbookEntry[]): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  entries.forEach((entry, index) => {
    const nearest = entries
      .map((other, otherIndex) => ({
        other,
        otherIndex,
        distance: otherIndex === index ? Number.POSITIVE_INFINITY : (other.x - entry.x) ** 2 + (other.y - entry.y) ** 2,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);
    nearest.forEach(({ other, otherIndex }) => {
      const id = [index, otherIndex].sort((a, b) => a - b).join('-');
      if (!seen.has(id) && Number.isFinite((other.x - entry.x) ** 2)) {
        seen.add(id);
        edges.push({ id, x1: entry.x, y1: entry.y, x2: other.x, y2: other.y });
      }
    });
  });
  return edges;
}

export default function GuestbookConstellation({ entries, siteKey }: Props) {
  const [token, setToken] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const edges = useMemo(() => buildEdges(entries), [entries]);
  const setTurnstileToken = useCallback((value: string) => setToken(value), []);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    if (!token || !siteKey) {
      setState('error');
      setMessage('Please complete verification before leaving a star.');
      return;
    }
    setState('sending');
    const form = new FormData(event.currentTarget);
    form.set('turnstileToken', token);
    try {
      const result = await actions.guestbook.submit(form);
      if (result.error) throw result.error;
      event.currentTarget.reset();
      setState('sent');
      setMessage('Your star is waiting for approval. Thank you for leaving evidence.');
    } catch {
      setState('error');
      setMessage('Your star could not be saved. Please try again later.');
    }
  }

  return <div className="guestbook-grid">
    <section className="constellation" aria-labelledby="constellation-title">
      <div className="constellation-heading">
        <p className="eyebrow">THE CONSTELLATION</p>
        <h2 id="constellation-title">evidence of people passing through.</h2>
        <p className="mono">{String(entries.length).padStart(2, '0')} APPROVED STARS</p>
      </div>
      <div className="star-field" aria-label="Guestbook constellation">
        {entries.length > 1 && <svg className="star-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {edges.map((edge) => <line key={edge.id} x1={edge.x1} y1={edge.y1} x2={edge.x2} y2={edge.y2} />)}
        </svg>}
        {entries.map((entry) => <button
          className="guest-star"
          key={entry.id}
          style={{ left: `${entry.x}%`, top: `${entry.y}%` }}
          aria-label={`${entry.name}: ${entry.message}`}
        >
          <span className="star-glyph" aria-hidden="true">✦</span>
          <span className="star-name">{entry.name.toLowerCase()}</span>
          <span className="star-note" role="tooltip">{entry.message}</span>
        </button>)}
        {entries.length === 0 && <p className="empty-constellation mono">the sky is quiet. leave the first star.</p>}
      </div>
      {entries.length > 0 && <ol className="guestbook-list" aria-label="Guestbook entries">
        {entries.map((entry) => <li key={entry.id}><strong>{entry.name}</strong><span>{entry.message}</span></li>)}
      </ol>}
    </section>

    <section className="guestbook-form-panel" aria-labelledby="leave-star-title">
      <p className="eyebrow">LEAVE EVIDENCE</p>
      <h2 id="leave-star-title">add a point of light.</h2>
      <p>No email required. Your note appears after a quick moderation check.</p>
      <form onSubmit={submit} noValidate>
        <div className="form-field">
          <label htmlFor="guest-name">Name</label>
          <input id="guest-name" name="name" required maxLength={40} autoComplete="name" />
        </div>
        <div className="form-field">
          <label htmlFor="guest-message">A thought, question, or recommendation</label>
          <textarea id="guest-message" name="message" required maxLength={280} />
        </div>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="guest-website">Website</label>
          <input id="guest-website" name="honeypot" tabIndex={-1} autoComplete="off" />
        </div>
        <TurnstileWidget siteKey={siteKey} onToken={setTurnstileToken} />
        <button className="button guest-submit" type="submit" disabled={state === 'sending' || !siteKey}>
          {state === 'sending' ? 'placing star…' : 'leave a star ✦'}
        </button>
        <p className="form-status" role={state === 'error' ? 'alert' : 'status'}>{message}</p>
      </form>
    </section>
  </div>;
}
