import { server } from '../config';

export async function loadSearchResults(q: string | string[]) {
  const res = await fetch(`${server}/api/search`, {
    body: JSON.stringify({ q }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return await res.json();
}

export async function loadSearchResultsOtherItems(q: string | string[]) {
  const res = await fetch(`${server}/api/search?mode=otherItems`, {
    body: JSON.stringify({ q }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return await res.json();
}
