import { useEffect, useState } from 'react';
import { actions } from 'astro:actions';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    actions.visitor.record({}).then(({ data }) => {
      if (active && typeof data?.count === 'number') setCount(data.count);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return <span aria-label={count === null ? 'Visitor count unavailable' : `Visitor number ${count}`}>
    YOU ARE VISITOR №{count === null ? '—' : String(count).padStart(4, '0')}
  </span>;
}
