import assert from 'node:assert/strict';
import test from 'node:test';
import { filterArticles, mergeById } from './knowledgeBaseUtils.js';

const articles = [
  { id: 1, title: 'Password reset', content: 'Account help', summary: '', category: 2, status: 'published', created_at: '2026-01-01' },
  { id: 2, title: 'Billing', content: 'Refund instructions', summary: 'Payment help', category: 3, status: 'draft', created_at: '2026-02-01' },
];
const defaults = { search: '', status: '', category: '', sort: 'newest' };

test('search matches content and summary, ignoring case and surrounding spaces', () => {
  for (const search of [' REFUND ', 'PAYMENT']) {
    assert.deepEqual(filterArticles(articles, { ...defaults, search }).map(item => item.id), [2]);
  }
});

test('search, status and category filters work together', () => {
  assert.deepEqual(filterArticles(articles, { ...defaults, search: 'help', status: 'published', category: '2' }).map(item => item.id), [1]);
  assert.deepEqual(filterArticles(articles, { ...defaults, status: 'draft', category: '2' }), []);
});

test('sorting does not mutate the original article list', () => {
  assert.deepEqual(filterArticles(articles, defaults).map(item => item.id), [2, 1]);
  assert.deepEqual(filterArticles(articles, { ...defaults, sort: 'oldest' }).map(item => item.id), [1, 2]);
  assert.deepEqual(filterArticles(articles, { ...defaults, sort: 'title' }).map(item => item.id), [2, 1]);
  assert.deepEqual(articles.map(item => item.id), [1, 2]);
});

test('overlapping pages keep one entry per ID and use the latest data', () => {
  const updated = { ...articles[0], title: 'Updated password guide' };
  assert.deepEqual(mergeById(articles, [updated]), [updated, articles[1]]);
});

test('recently updated sorting falls back to creation dates', () => {
  const records = [{ ...articles[0], updated_at: '2026-03-01' }, articles[1]];
  assert.deepEqual(filterArticles(records, { ...defaults, sort: 'updated' }).map(item => item.id), [1, 2]);
});
