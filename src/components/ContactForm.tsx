import { useCallback, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { actions } from 'astro:actions';
import TurnstileWidget from './TurnstileWidget';

interface Props {
  siteKey: string;
}

export default function ContactForm({ siteKey }: Props) {
  const [token, setToken] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const setTurnstileToken = useCallback((value: string) => setToken(value), []);

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    if (!token || !siteKey) {
      setState('error');
      setMessage('Please complete verification before sending.');
      return;
    }
    setState('sending');
    setMessage('');
    const form = new FormData(event.currentTarget);
    form.set('turnstileToken', token);
    try {
      const result = await actions.contact.send(form);
      if (result.error) throw result.error;
      event.currentTarget.reset();
      setState('sent');
      setMessage('Sent. Thank you for writing — I’ll get back to you soon.');
    } catch {
      setState('error');
      setMessage('The message could not be sent. Please use the direct email link instead.');
    }
  }

  return <form className="contact-form" onSubmit={submit} noValidate>
    <div className="form-field">
      <label htmlFor="contact-name">Name</label>
      <input id="contact-name" name="name" required maxLength={80} autoComplete="name" />
    </div>
    <div className="form-field">
      <label htmlFor="contact-email">Email</label>
      <input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" />
    </div>
    <div className="form-field">
      <label htmlFor="contact-subject">Subject <span className="muted">(optional)</span></label>
      <input id="contact-subject" name="subject" maxLength={120} />
    </div>
    <div className="form-field">
      <label htmlFor="contact-message">Message</label>
      <textarea id="contact-message" name="message" required maxLength={2000} />
    </div>
    <div className="honeypot" aria-hidden="true">
      <label htmlFor="contact-website">Website</label>
      <input id="contact-website" name="honeypot" tabIndex={-1} autoComplete="off" />
    </div>
    <TurnstileWidget siteKey={siteKey} onToken={setTurnstileToken} />
    <div className="form-actions">
      <button className="button" type="submit" disabled={state === 'sending' || !siteKey}>
        {state === 'sending' ? 'sending…' : 'send message'}
      </button>
      <p className="form-status" role={state === 'error' ? 'alert' : 'status'}>{message}</p>
    </div>
  </form>;
}
