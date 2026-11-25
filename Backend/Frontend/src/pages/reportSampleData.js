// Frontend-only fixtures. Never import these into customer/API write paths.
export const statuses = ['Open', 'In progress', 'Resolved'];
const categories = ['Delivery', 'Payment', 'Refunds', 'Product defects'];
const agents = ['Jordan Davis', 'Priya Shah', 'Alex Morgan'];
const teams = ['Customer support', 'Order support'];
const priorities = ['Normal', 'High', 'Urgent'];
const channels = ['Email', 'Chat', 'Phone'];
const option = values => values.map(value => ({ value, label: value }));
export const sampleOptions = {
  agents: option(agents), teams: option(teams), priorities: option(priorities),
  categories: option(categories), channels: option(channels),
};
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function shift(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
export function createSampleRecords(today = new Date()) {
  return Array.from({ length: 90 }, (_, age) => {
    const date = dateKey(shift(today, -age));
    const count = 8 + (age * 7 % 13);
    return Array.from({ length: count }, (_, index) => {
      const seed = age * 23 + index;
      const resolved = age > 12 ? seed % 10 < 9 : seed % 10 < 6;
      return {
        id: `sample-${date}-${index}`, date,
        status: resolved ? 'Resolved' : statuses[seed % 2],
        category: categories[seed % 4], agent: agents[seed % 3],
        team: teams[Math.floor(seed / 3) % 2], priority: priorities[Math.floor(seed / 7) % 3],
        channel: channels[Math.floor(seed / 5) % 3],
        responseMinutes: 6 + seed % 85,
        resolutionMinutes: resolved ? 75 + seed % 650 : null,
        positiveFeedback: resolved && seed % 3 !== 0 ? seed % 11 !== 0 : null,
      };
    });
  }).flat();
}
export function selectSampleRecords(records, filters, today = new Date()) {
  const end = filters.range === 'custom' ? filters.end_date : dateKey(today);
  const start = filters.range === 'custom' ? filters.start_date
    : dateKey(shift(today, -(filters.range === 'today' ? 0 : filters.range === '7d' ? 6 : 29)));
  return records.filter(record => record.date >= start && record.date <= end &&
    ['agent', 'team', 'priority', 'category', 'channel'].every(key => !filters[key] || filters[key] === record[key]));
}
const round = value => Math.round(value * 10) / 10;
const average = values => values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null;
const percentage = (count, total) => total ? round(count / total * 100) : null;
export function buildSampleReport(records, filters, today = new Date()) {
  const selected = selectSampleRecords(records, filters, today);
  const resolved = selected.filter(row => row.status === 'Resolved');
  const feedback = selected.filter(row => row.positiveFeedback !== null);
  const days = [...new Set(selected.map(row => row.date))].sort();
  const daily = days.map(label => ({ label, rows: selected.filter(row => row.date === label) }));
  return {
    sample: true,
    kpis: {
      total_tickets: selected.length, resolved_tickets: resolved.length,
      resolved_percent: percentage(resolved.length, selected.length),
      backlog: selected.length - resolved.length,
      avg_response_seconds: selected.length ? average(selected.map(row => row.responseMinutes)) * 60 : null,
      avg_resolution_seconds: resolved.length ? average(resolved.map(row => row.resolutionMinutes)) * 60 : null,
      csat_percent: percentage(feedback.filter(row => row.positiveFeedback).length, feedback.length),
      sla_compliance_percent: percentage(resolved.filter(row => row.responseMinutes <= 60 && row.resolutionMinutes <= 480).length, resolved.length),
    },
    query_volume: daily.map(({ label, rows }) => ({ label, tickets: rows.length })),
    query_status: statuses.map(label => ({ label, value: selected.filter(row => row.status === label).length })),
    querys_by_category: categories.map(label => ({ label, tickets: selected.filter(row => row.category === label).length })),
    agent_performance: agents.map(label => ({ label, resolved: resolved.filter(row => row.agent === label).length })),
    csat_trend: daily.flatMap(({ label, rows }) => {
      const rated = rows.filter(row => row.positiveFeedback !== null);
      return rated.length ? [{ label, score: percentage(rated.filter(row => row.positiveFeedback).length, rated.length) }] : [];
    }),
    response_resolution: daily.map(({ label, rows }) => ({
      label, response_minutes: average(rows.map(row => row.responseMinutes)),
      resolution_minutes: average(rows.filter(row => row.status === 'Resolved').map(row => row.resolutionMinutes)),
    })),
  };
}
