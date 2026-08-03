import { createOptimizedPicture } from '../../scripts/aem.js';

async function fetchIndex(source) {
  const response = await fetch(source);
  if (!response.ok) return [];
  const json = await response.json();
  return json.data || [];
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
  a.append(body);
  li.append(a);
  return li;
}

export default async function decorate(block) {
  const [pathRow, limitRow] = block.children;
  const link = pathRow ? pathRow.querySelector('a[href]') : null;
  const path = link ? new URL(link.href).pathname : '/articles';
  const limit = limitRow ? parseInt(limitRow.textContent.trim(), 10) : 0;
  block.textContent = '';

  const list = document.createElement('ul');
  list.className = 'articles-list';
  block.append(list);

  const data = await fetchIndex(`${window.hlx.codeBasePath}/query-index.json`);
  const currentPath = window.location.pathname;
  let articles = data
    .filter((entry) => entry.path.startsWith(`${path}/`) && entry.path !== currentPath)
    .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

  if (limit) articles = articles.slice(0, limit);

  if (!articles.length) {
    const empty = document.createElement('li');
    empty.className = 'articles-empty';
    empty.textContent = 'No articles yet.';
    list.append(empty);
    return;
  }

  articles.forEach((article) => list.append(renderArticle(article)));
}
