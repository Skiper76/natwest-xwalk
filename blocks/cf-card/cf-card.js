/*
 * CF Card Block
 * Renders a Content Fragment (Product Card model) referenced by the
 * "reference" field, either as a styled card or as its raw JSON.
 * Fetching a Content Fragment's JSON requires an authenticated AEM
 * session (same-origin request with credentials) — this only resolves
 * when viewed on the author host or through Universal Editor, not on an
 * anonymous public request, unless the fragment is exposed for
 * anonymous read on the publish tier.
 */

function renderJson(block, data) {
  const pre = document.createElement('pre');
  pre.className = 'cf-card-json';
  pre.textContent = JSON.stringify(data, null, 2);
  block.append(pre);
}

function renderCard(block, data) {
  const {
    title, description, image, linkHref, linkText,
  } = data;
  const card = document.createElement('div');
  card.className = 'cf-card-item';

  if (image) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'cf-card-image';
    const img = document.createElement('img');
    img.src = image;
    img.alt = '';
    img.loading = 'lazy';
    imageWrapper.append(img);
    card.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'cf-card-body';
  if (title) {
    const heading = document.createElement('h3');
    heading.textContent = title;
    body.append(heading);
  }
  if (description) {
    const p = document.createElement('p');
    p.textContent = description;
    body.append(p);
  }
  if (linkHref && linkText) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = linkHref;
    a.textContent = linkText;
    p.append(a);
    body.append(p);
  }
  card.append(body);
  block.append(card);
}

export default async function decorate(block) {
  const [refRow, modeRow] = block.children;
  const link = refRow ? refRow.querySelector('a[href]') : null;
  const path = link ? link.getAttribute('href') : '';
  const displayMode = (modeRow ? modeRow.textContent.trim().toLowerCase() : 'card') || 'card';
  block.textContent = '';

  if (!path) {
    block.textContent = 'No content fragment selected.';
    return;
  }

  let json;
  try {
    const res = await fetch(`${path}.infinity.json`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    json = await res.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load content fragment', path, error);
    block.textContent = 'Unable to load content fragment.';
    return;
  }

  const data = json['jcr:content']?.data?.master || {};

  if (displayMode === 'json') {
    renderJson(block, data);
  } else {
    renderCard(block, data);
  }
}
