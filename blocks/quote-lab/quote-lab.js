export default function decorate(block) {
  const [quoteRow, authorRow] = block.children;
  const quoteText = quoteRow ? quoteRow.textContent.trim() : '';
  const author = authorRow ? authorRow.textContent.trim() : '';

  block.textContent = '';

  const blockquote = document.createElement('blockquote');
  blockquote.textContent = quoteText;
  block.append(blockquote);

  if (author) {
    const cite = document.createElement('cite');
    cite.textContent = author;
    block.append(cite);
  }
}
