export function mergeById(existing, incoming) {
  return [...new Map([...existing, ...incoming].map(item => [item.id, item])).values()];
}

export function filterArticles(articles, { search, status, category, sort }) {
  const query = search.trim().toLowerCase();
  return articles.filter(article =>
    (!status || article.status === status) &&
    (!category || String(article.category) === category) &&
    [article.title, article.summary, article.content].some(value =>
      (value || '').toLowerCase().includes(query))
  ).sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'updated') return (Date.parse(b.updated_at || b.created_at) || 0) - (Date.parse(a.updated_at || a.created_at) || 0);
    const difference = (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0);
    return sort === 'oldest' ? difference : -difference;
  });
}
