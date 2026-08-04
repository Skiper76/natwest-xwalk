async function fetchIndex() {
  const res = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

function titleForPath(path, data) {
  const entry = data.find((e) => e.path === path);
  if (entry && entry.title) return entry.title;
  const segment = path.split('/').filter(Boolean).pop() || '';
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function decorate(block) {
  const rootLabel = block.textContent.trim() || 'Home';
  block.textContent = '';

  // Strip a trailing .html (present when viewed in the authoring canvas) and
  // only keep the last two meaningful segments (immediate section + current
  // page), ignoring any content-root path segments before them.
  const cleanPathname = window.location.pathname.replace(/\.html$/, '');
  const allSegments = cleanPathname.split('/').filter(Boolean);
  const segments = allSegments.slice(-2);

  const data = segments.length ? await fetchIndex() : [];

  const crumbs = [{ path: '/', label: rootLabel }];
  segments.forEach((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    crumbs.push({ path, label: titleForPath(path, data) });
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = document.createElement('ol');

  crumbs.forEach((crumb, index) => {
    const li = document.createElement('li');
    if (index === crumbs.length - 1) {
      li.textContent = crumb.label;
      li.setAttribute('aria-current', 'page');
    } else {
      const a = document.createElement('a');
      a.href = crumb.path;
      a.textContent = crumb.label;
      li.append(a);
    }
    list.append(li);
  });

  nav.append(list);
  block.append(nav);
}
