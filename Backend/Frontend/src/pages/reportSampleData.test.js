import test from 'node:test';
import assert from 'node:assert/strict';
import { createSampleRecords, selectSampleRecords, buildSampleReport, sampleOptions } from './reportSampleData.js';

const today = new Date(2026, 10, 23, 12);
const records = createSampleRecords(today);
const base = { range: '30d' };
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);

test('default report has the expected 30-day fixture totals', () => {
  const report = buildSampleReport(records, base, today);
  assert.equal(report.kpis.total_tickets, 412);
  assert.deepEqual(report.ticket_status.map(row => row.value), [36, 59, 317]);
  assert.deepEqual(report.tickets_by_category.map(row => row.tickets), [104, 103, 102, 103]);
  assert.equal(report.kpis.csat_percent, 92);
});

test('every range and dimension reconciles cards, charts and records', () => {
  const filters = [base, { range: 'today' }, { range: '7d' },
    { range: 'custom', start_date: '2026-11-01', end_date: '2026-11-15' }];
  for (const [field, key] of Object.entries({ agent: 'agents', team: 'teams', priority: 'priorities', category: 'categories', channel: 'channels' })) {
    for (const { value } of sampleOptions[key]) filters.push({ ...base, [field]: value });
  }
  filters.push({ ...base, agent: 'Priya Shah', category: 'Payment', team: 'Order support', priority: 'High', channel: 'Chat' });
  for (const filter of filters) {
    const rows = selectSampleRecords(records, filter, today);
    const report = buildSampleReport(records, filter, today);
    assert.equal(report.kpis.total_tickets, rows.length);
    assert.equal(sum(report.query_status, 'value'), rows.length);
    assert.equal(sum(report.query_volume, 'tickets'), rows.length);
    assert.equal(sum(report.querys_by_category, 'tickets'), rows.length);
    assert.equal(sum(report.agent_performance, 'resolved'), report.kpis.resolved_tickets);
    assert.equal(report.kpis.backlog + report.kpis.resolved_tickets, rows.length);
    const ratings = rows.filter(row => row.positiveFeedback !== null);
    const expected = ratings.length ? Math.round(ratings.filter(row => row.positiveFeedback).length / ratings.length * 1000) / 10 : null;
    assert.equal(report.kpis.csat_percent, expected);
  }
});

test('custom dates are inclusive and empty results do not invent averages', () => {
  const rows = selectSampleRecords(records, { range: 'custom', start_date: '2026-11-23', end_date: '2026-11-23' }, today);
  assert.equal(rows.length, 8);
  assert.ok(rows.every(row => row.date === '2026-11-23'));
  const empty = buildSampleReport(records, { range: 'custom', start_date: '2027-01-01', end_date: '2027-01-02' }, today);
  assert.equal(empty.kpis.total_tickets, 0);
  assert.equal(empty.kpis.csat_percent, null);
  assert.equal(empty.kpis.avg_response_seconds, null);
  assert.equal(empty.kpis.avg_resolution_seconds, null);
  assert.deepEqual(empty.query_volume, []);
});

test('fixtures are repeatable and aggregation never mutates records', () => {
  const original = structuredClone(records);
  buildSampleReport(records, base, today);
  assert.deepEqual(records, original);
  assert.deepEqual(createSampleRecords(today), original);
  assert.equal(new Set(records.map(row => row.id)).size, records.length);
});
