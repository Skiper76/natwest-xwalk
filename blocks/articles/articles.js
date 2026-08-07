import { createOptimizedPicture } from '../../scripts/aem.js';

async function fetchIndex(source) {
  const response = await fetch(source);
  if (!response.ok) return [];
  const json = await response.json();
  return json.data || [];
}

function formatDate(lastModified) {
  if (!lastModified) return '';
  return new Date(lastModified * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function renderArticle(article) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = article.path;

  if (article.image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'articles-card-image';
    wrapper.append(createOptimizedPicture(article.image, '', false, [{ width: '375' }]));
    a.append(wrapper);
  }

  const body = document.createElement('div');
  body.className = 'articles-card-body';
  if (article.title) {
    const title = document.createElement('h3');
    title.textContent = article.title;
    body.append(title);
  }
  if (article.description) {
    const description = document.createElement('p');
    description.textContent = article.description;
    body.append(description);
  }
  const date = formatDate(article.lastModified);
  if (date) {
    const dateEl = document.createElement('p');
    dateEl.className = 'articles-card-date';
    dateEl.textContent = date;
    body.append(dateEl);
  }
  a.append(body);
  li.append(a);
  return li;
}

export default async function decorate(block) {
  const [pathRow, limitRow] = block.children;
  const link = pathRow ? pathRow.querySelector('a[href]') : null;
  const path = link ? new URL(link.href).pathname : '/index/articles';
  const limit = limitRow ? parseInt(limitRow.textContent.trim(), 10) : 0;
  block.textContent = '';

  if (limit) {
    block.classList.add('articles-related');
    const heading = document.createElement('h2');
    heading.className = 'articles-heading';
    heading.textContent = 'Related articles';
    block.append(heading);
  }

  const list = document.createElement('ul');
  list.className = 'articles-list';
  block.append(list);

  const data = await fetchIndex(`${window.hlx.codeBasePath}/query-index.json`);
  const currentPath = window.location.pathname;
  let articles = data
    .filter((entry) => entry.path.startsWith(`${path}/`) && entry.path !== currentPath)
    .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

  const total = articles.length;
  if (limit) articles = articles.slice(0, limit);

  if (!total) {
    const empty = document.createElement('li');
    empty.className = 'articles-empty';
    empty.textContent = 'No articles yet.';
    list.append(empty);
    return;
  }

  if (!limit) {
    const count = document.createElement('p');
    count.className = 'articles-count';
    count.textContent = `Showing ${total} article${total === 1 ? '' : 's'}`;
    block.insertBefore(count, list);
  }

  articles.forEach((article) => list.append(renderArticle(article)));

  if (limit) {
    const allLink = document.createElement('a');
    allLink.className = 'articles-all-link';
    allLink.href = path;
    allLink.textContent = 'All articles';
    block.append(allLink);
  }
}
