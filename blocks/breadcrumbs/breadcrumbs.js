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

  const { pathname } = window.location;
  const segments = pathname.split('/').filter(Boolean);
  const data = segments.length ? await fetchIndex() : [];

  const crumbs = [{ path: '/', label: rootLabel }];
  let accumulated = '';
  segments.forEach((segment) => {
    accumulated += `/${segment}`;
    crumbs.push({ path: accumulated, label: titleForPath(accumulated, data) });
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
