import { useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';

export default function WordGame() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'wrong' | 'solved'>('idle');

  function check(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const guess = inputRef.current?.value.trim().toLowerCase();
    setState(guess === 'wandering' ? 'solved' : 'wrong');
  }

  if (state === 'solved') {
    return <div className="game-reward" aria-live="polite">
      <p className="eyebrow">CORRECT — A SMALL REWARD</p>
      <p>go listen to Adrianne Lenker, then read Joan Didion’s “On Keeping a Notebook.” a small starter kit for wandering.</p>
    </div>;
  }

  return <form className="word-game" onSubmit={check} noValidate>
    <p className="game-prompt">unscramble this — solve it and something small appears.</p>
    <p className="game-scramble mono" aria-label="R A N D W I N G E">R A N D W I N G E</p>
    <p className="game-hint mono">hint: 9 letters · the thing you're doing right now.</p>
    <div className="game-controls">
      <label className="honeypot" htmlFor="word-guess-label">Your guess</label>
      <input id="word-guess-label" ref={inputRef} placeholder="type your guess" autoComplete="off" aria-describedby="word-game-status" />
      <button className="button" type="submit">reveal</button>
    </div>
    <p id="word-game-status" className="form-status" aria-live="polite">
      {state === 'wrong' ? 'not quite — keep wandering.' : ''}
    </p>
  </form>;
}
