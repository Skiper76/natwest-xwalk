export default function decorate(block) {
  const [authorRow, dateRow] = block.children;
  const author = authorRow ? authorRow.textContent.trim() : '';
  const date = dateRow ? dateRow.textContent.trim() : '';
  block.textContent = '';

  if (author) {
    const authorEl = document.createElement('span');
    authorEl.className = 'article-byline-author';
    authorEl.textContent = `By ${author}`;
    block.append(authorEl);
  }
  if (date) {
    const dateEl = document.createElement('span');
    dateEl.className = 'article-byline-date';
    dateEl.textContent = date;
    block.append(dateEl);
  }
}
