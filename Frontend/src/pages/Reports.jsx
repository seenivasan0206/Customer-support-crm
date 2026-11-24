import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Download,
  RefreshCw,
  Save,
  CalendarClock,
  Ticket,
  CheckCircle2,
  Clock3,
  Smile,
  SlidersHorizontal,
} from "lucide-react";
import "./Reports.css";
import { createSampleRecords, buildSampleReport, sampleOptions, dateKey } from "./reportSampleData";

// All reporting requests stay in this page. The backend supplies the aggregates.
const apiBase = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/$/, "");
const reportsUrl = (
  import.meta.env.VITE_REPORTS_API_URL || `${apiBase}/reports`
).replace(/\/$/, ""); ////////////
const initialFilters = {
  range: "30d",
  start_date: "",
  end_date: "",
  agent: "",
  team: "",
  priority: "",
  category: "",
  channel: "",
};
const filterFields = [
  ["agent", "Agent", "agents"],
  ["team", "Team / department", "teams"],
  ["priority", "Priority", "priorities"],
  ["category", "Category", "categories"],
  ["channel", "Channel", "channels"],
];
const colors = ["#2563eb", "#e9a23b", "#159b82", "#8b93a7"];
const charts = [
  {
    key: "query_volume",
    title: "query over time",
    // subtitle: "Incoming ticket volume",
    subtitle: "Incoming query volume",
    type: "line",
    fields: [["tickets", "Tickets"]],
    unit: "tickets",
  },
  {
    key: "query_status",
    title: "query status",
    subtitle: "Current distribution of query",
    type: "donut",
    fields: [["value", "Tickets"]],
    unit: "tickets",
  },
  {
    key: "querys_by_category",
    title: "querys by category",
    subtitle: "Where customers need help",
    type: "bar",
    fields: [["tickets", "Tickets"]],
    unit: "tickets",
  },
  {
    key: "agent_performance",
    title: "Agent performance",
    subtitle: "Resolved tickets by agent",
    type: "horizontal",
    fields: [["resolved", "Resolved tickets"]],
    unit: "tickets",
  },
  {
    key: "csat_trend",
    title: "Customer satisfaction",
    subtitle: "Positive feedback over time",
    type: "line",
    fields: [["score", "CSAT (%)"]],
    unit: "%",
  },
  {
    key: "response_resolution",
    title: "Response & resolution time",
    subtitle: "Average times in minutes",
    type: "bar",
    fields: [
      ["response_minutes", "First response"],
      ["resolution_minutes", "Resolution"],
    ],
    unit: "minutes",
  },
];

function buildQuery(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (
      value &&
      (filters.range === "custom" || !["start_date", "end_date"].includes(key))
    )
      params.set(key, value);
  }
  params.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  return params.toString();
}

async function reportRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${reportsUrl}/${path}`, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the reporting service. Check the connection and try again.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404)
      throw new Error(
        "Reporting is not available yet. Please contact your administrator.",
      );
    if (response.status >= 500)
      throw new Error(
        "The reporting service is unavailable. Please try again later.",
      );
    const detail =
      data && typeof data === "object"
        ? Object.entries(data)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
            )
            .join(" ")
        : "";
    throw new Error(detail || `Request failed (${response.status}).`);
  }
  if (!data || typeof data !== "object")
    throw new Error("The reporting service returned an unexpected response.");
  return data;
}

function number(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "—";
}
function percent(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString()}%`
    : "—";
}
function duration(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0)
    return "—";
  const total = Math.round(seconds);
  return total >= 3600
    ? `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`
    : `${Math.floor(total / 60)}m ${total % 60}s`;
}
function change(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value > 0 ? "+" : ""}${value}% vs previous period`
    : "No comparison available";
}
function csvCell(value) {
  let text = String(value ?? "");
  // Prevent spreadsheet applications from interpreting untrusted labels as formulas.
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
function reportCsv(report, filters) {
  const rows = [
    [report.sample ? "Reports & Analysis — SAMPLE DATA" : "Reports & Analysis"],
    ["Filters", buildQuery(filters)],
    [],
    ["Metric", "Value"],
  ];
  for (const [key, value] of Object.entries(report.kpis))
    rows.push([key, value]);
  for (const chart of charts) {
    rows.push(
      [],
      [chart.title],
      ["Label", ...chart.fields.map(([, label]) => label)],
    );
    for (const item of report[chart.key] || [])
      rows.push([item.label, ...chart.fields.map(([key]) => item[key])]);
  }
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
function downloadFile(content, type, filename) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function validateReport(data) {
  if (!data.kpis || typeof data.kpis !== "object" || Array.isArray(data.kpis))
    throw new Error("The reporting response is missing its metrics.");
  for (const chart of charts) {
    if (
      !Array.isArray(data[chart.key]) ||
      data[chart.key].some(
        (row) =>
          !row ||
          typeof row.label !== "string" ||
          chart.fields.some(
            ([key]) =>
              typeof row[key] !== "number" ||
              !Number.isFinite(row[key]) ||
              row[key] < 0 ||
              (chart.unit === "%" && row[key] > 100),
          ),
      )
    ) {
      throw new Error(
        `The reporting response has invalid data for ${chart.title.toLowerCase()}.`,
      );
    }
  }
  return data;
}

function ReportChart({ chart, data, loading, sample }) {
  const container = useRef(null);
  const hasData =
    data.length > 0 &&
    (chart.type !== "donut" || data.some((row) => row.value > 0));
  const download = () => {
    const svg = container.current?.querySelector("svg.recharts-surface");
    if (!svg) return;
    const copy = svg.cloneNode(true);
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute(
      "style",
      "background:white;font-family:Arial,sans-serif;font-size:12px",
    );
    const width = svg.getBoundingClientRect().width;
    const height = svg.getBoundingClientRect().height;
    const legend =
      chart.type === "donut"
        ? data.map((row) => row.label)
        : chart.fields.map(([, label]) => label);
    const output = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    output.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    output.setAttribute("width", width);
    output.setAttribute("height", height + 50 + legend.length * 20);
    output.setAttribute(
      "style",
      "background:white;font-family:Arial,sans-serif;font-size:12px",
    );
    const heading = document.createElementNS(output.namespaceURI, "text");
    heading.setAttribute("x", "12");
    heading.setAttribute("y", "20");
    heading.textContent = `${chart.title}${sample ? " — SAMPLE DATA" : ""}`;
    output.appendChild(heading);
    copy.setAttribute("y", "32");
    output.appendChild(copy);
    legend.forEach((label, index) => {
      const text = document.createElementNS(output.namespaceURI, "text");
      text.setAttribute("x", "12");
      text.setAttribute("y", height + 50 + index * 20);
      text.setAttribute("fill", colors[index % colors.length]);
      text.textContent = label;
      output.appendChild(text);
    });
    downloadFile(
      new XMLSerializer().serializeToString(output),
      "image/svg+xml",
      `${sample ? "sample-" : ""}${chart.key}.svg`,
    );
  };
  const axis = {
    tick: { fill: "#64748b", fontSize: 11 },
    axisLine: false,
    tickLine: false,
  };
  return (
    <section className="report-chart" aria-labelledby={`${chart.key}-title`}>
      <div className="report-chart__header">
        <div>
          <h3 id={`${chart.key}-title`}>{chart.title}</h3>
          <p>{chart.subtitle}</p>
        </div>
        <button
          className="report-icon-button report-no-print"
          type="button"
          disabled={!hasData || loading}
          onClick={download}
          aria-label={`Download ${chart.title} chart as SVG`}
          title="Download SVG"
        >
          <Download size={16} />
        </button>
      </div>
      <div className="report-chart__plot" ref={container}>
        {loading ? (
          <div className="report-chart__empty" role="status">
            Loading chart…
          </div>
        ) : !hasData ? (
          <div className="report-chart__empty">No data for this selection</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === "donut" ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`${item.label}-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            ) : chart.type === "line" ? (
              <LineChart
                data={data}
                margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                <XAxis dataKey="label" {...axis} minTickGap={25} />
                <YAxis
                  {...axis}
                  domain={chart.unit === "%" ? [0, 100] : [0, "auto"]}
                  allowDecimals={chart.unit === "%"}
                  width={45}
                />
                <Tooltip />
                {chart.fields.map(([key, label], i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={colors[i]}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={data}
                layout={chart.type === "horizontal" ? "vertical" : "horizontal"}
                margin={{ top: 10, right: 16, left: 0, bottom: 4 }}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} stroke="#edf0f5" />
                {chart.type === "horizontal" ? (
                  <>
                    <XAxis type="number" {...axis} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      {...axis}
                      width={95}
                    />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="label" {...axis} minTickGap={15} />
                    <YAxis
                      {...axis}
                      width={45}
                      allowDecimals={chart.unit === "minutes"}
                    />
                  </>
                )}
                <Tooltip />
                {chart.fields.length > 1 && <Legend iconType="circle" />}
                {chart.fields.map(([key, label], i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={label}
                    fill={colors[i]}
                    radius={
                      chart.type === "horizontal" ? [0, 4, 4, 0] : [4, 4, 0, 0]
                    }
                    maxBarSize={32}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      {hasData && !loading && (
        <details className="report-chart__table">
          <summary>View data</summary>
          <div className="report-table-scroll">
            <table>
              <caption>
                {chart.title} ({chart.unit})
              </caption>
              <thead>
                <tr>
                  <th scope="col">Label</th>
                  {chart.fields.map(([key, label]) => (
                    <th key={key} scope="col">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <th scope="row">{row.label}</th>
                    {chart.fields.map(([key]) => (
                      <td key={key}>{number(row[key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

export default function Reports() {
  const [sample, setSample] = useState(true);
  return <ReportsContent key={String(sample)} sample={sample} onSourceChange={() => setSample(value => !value)} />;
}

function ReportsContent({ sample, onSourceChange }) {
  const [sampleToday] = useState(() => new Date());
  const [sampleRecords] = useState(() => createSampleRecords(sampleToday));
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [options, setOptions] = useState({});
  const [optionsError, setOptionsError] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [updated, setUpdated] = useState(null);
  const [action, setAction] = useState("");
  const [actionName, setActionName] = useState("");
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [time, setTime] = useState("09:00");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const actionRequest = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setOptionsError("");
    if (sample) {
      setOptions(sampleOptions);
      return () => controller.abort();
    }
    reportRequest("options/", { method: "GET", signal: controller.signal })
      .then((data) => {
        for (const [, , key] of filterFields) {
          if (
            !Array.isArray(data[key]) ||
            data[key].some(
              (item) =>
                !item ||
                !["string", "number"].includes(typeof item.value) ||
                typeof item.label !== "string",
            )
          )
            throw new Error(
              "Filter options are not available in the expected format.",
            );
        }
        if (!controller.signal.aborted) setOptions(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setOptionsError(failure.message);
      });
    return () => controller.abort();
  }, [refresh, sample]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setReport(null);
    setUpdated(null);
    if (sample) {
      setReport(buildSampleReport(sampleRecords, applied, sampleToday));
      setUpdated(new Date());
      setLoading(false);
      return () => controller.abort();
    }
    reportRequest(`summary/?${buildQuery(applied)}`, {
      method: "GET",
      signal: controller.signal,
    })
      .then(validateReport)
      .then((data) => {
        if (!controller.signal.aborted) {
          setReport(data);
          setUpdated(new Date());
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [applied, refresh, sample, sampleRecords, sampleToday]);
  useEffect(() => () => actionRequest.current?.abort(), []);

  const applyFilters = (event) => {
    event.preventDefault();
    if (
      filters.range === "custom" &&
      (!filters.start_date ||
        !filters.end_date ||
        filters.start_date > filters.end_date)
    ) {
      setFilterError(
        "Choose a valid start and end date. The end date must be on or after the start date.",
      );
      return;
    }
    setFilterError("");
    setApplied({ ...filters });
    setMessage("");
  };
  const openAction = (kind) => {
    setAction(kind);
    setActionName("");
    setActionError("");
    setMessage("");
  };
  const saveAction = async (event) => {
    event.preventDefault();
    if (sample || actionRequest.current) return;
    if (!actionName.trim()) {
      setActionError("Enter a report name.");
      return;
    }
    const controller = new AbortController();
    actionRequest.current = controller;
    setSaving(true);
    setActionError("");
    const payload = {
      name: actionName.trim(),
      filters: {
        ...applied,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      charts: charts.map((chart) => chart.key),
    };
    if (action === "schedule")
      Object.assign(payload, {
        recipient: email.trim(),
        frequency,
        time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        format: "pdf",
        ...(frequency === "weekly"
          ? { day_of_week: 1 }
          : frequency === "monthly"
            ? { day_of_month: 1 }
            : {}),
      });
    try {
      await reportRequest(action === "schedule" ? "schedules/" : "saved/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setMessage(
          action === "schedule"
            ? "Report schedule created."
            : "Custom report saved.",
        );
        setAction("");
      }
    } catch (failure) {
      if (!controller.signal.aborted) setActionError(failure.message);
    } finally {
      actionRequest.current = null;
      if (!controller.signal.aborted) setSaving(false);
    }
  };
  const kpis = report?.kpis || {};
  const cards = [
    {
      title: "Total tickets",
      value: number(kpis.total_tickets),
      detail: change(kpis.ticket_change_percent),
      icon: Ticket,
      color: "blue",
    },
    {
      title: "Resolved tickets",
      value: number(kpis.resolved_tickets),
      detail: `${percent(kpis.resolved_percent)} resolved`,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Avg. first response",
      value: duration(kpis.avg_response_seconds),
      detail: change(kpis.response_change_percent),
      icon: Clock3,
      color: "amber",
    },
    {
      title: "Customer satisfaction",
      value: percent(kpis.csat_percent),
      detail: "Positive customer feedback",
      icon: Smile,
      color: "teal",
    },
  ];
  const rangeLabel = {
    today: "Today",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    custom: `${applied.start_date} – ${applied.end_date}`,
  }[applied.range];
  const changed = JSON.stringify(filters) !== JSON.stringify(applied);

  return (
    <div className="reports-page">
      <header className="reports-heading">
        <div>
          <span className="reports-eyebrow">SUPPORT INTELLIGENCE</span>
          <h2>Reports & Analysis</h2>
          <p>
            A clear view of your team's volume, efficiency, and customer
            experience.
          </p>
        </div>
        <div className="report-actions report-no-print">
          <button
            type="button"
            disabled={!report || loading}
            onClick={() =>
              downloadFile(
                reportCsv(report, applied),
                "text/csv;charset=utf-8",
                sample ? "sample-support-report.csv" : "support-report.csv",
              )
            }
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            disabled={!report || loading}
            onClick={() => window.print()}
            title="Open the print dialog and choose Save as PDF"
          >
            Export PDF
          </button>
        </div>
      </header>

      <div className="report-source">
        <div>
          <strong>{sample ? "Sample data · Frontend demo" : "Live reporting API"}</strong>
          <p>{sample
            ? `Fictional tickets from ${sampleRecords.at(-1).date} through ${dateKey(sampleToday)}. Filters use creation dates. Saving and scheduling are unavailable for sample data.`
            : "Reports and filter choices come from the existing reporting service."}</p>
        </div>
        <button type="button" className="report-no-print" disabled={saving} onClick={onSourceChange}>
          {sample ? "Use live reports" : "Use sample data"}
        </button>
      </div>
      <form className="report-filters report-no-print" onSubmit={applyFilters}>
        <div className="report-filter-heading">
          <SlidersHorizontal size={16} />
          <strong>Filter your report</strong>
          {changed && <span>Unapplied changes</span>}
        </div>
        <div className="report-filter-grid">
          <label>
            Date range
            <select
              value={filters.range}
              onChange={(event) =>
                setFilters({ ...filters, range: event.target.value })
              }
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom range</option>
            </select>
          </label>
          {filterFields.map(([field, label, key]) => (
            <label key={field}>
              {label}
              <select
                value={filters[field]}
                disabled={!options[key]}
                onChange={(event) =>
                  setFilters({ ...filters, [field]: event.target.value })
                }
              >
                <option value="">
                  All{" "}
                  {field === "priority"
                    ? "priorities"
                    : field === "category"
                      ? "categories"
                      : field === "team"
                        ? "teams"
                        : `${field}s`}
                </option>
                {(options[key] || []).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {filters.range === "custom" && (
          <div className="report-custom-dates">
            <label>
              Start date
              <input
                type="date"
                required
                value={filters.start_date}
                onChange={(event) =>
                  setFilters({ ...filters, start_date: event.target.value })
                }
              />
            </label>
            <label>
              End date
              <input
                type="date"
                required
                min={filters.start_date}
                value={filters.end_date}
                onChange={(event) =>
                  setFilters({ ...filters, end_date: event.target.value })
                }
              />
            </label>
          </div>
        )}
        {filterError && (
          <p className="report-error" role="alert">
            {filterError}
          </p>
        )}
        {optionsError && (
          <p className="report-filter-warning" role="status">
            Filter choices could not be loaded. {optionsError}
          </p>
        )}
        <div className="report-filter-footer">
          <span>All metrics and charts use the applied filters.</span>
          <button className="report-primary" type="submit">
            Apply filters
          </button>
        </div>
      </form>

      <div className="report-toolbar">
        <div>
          <strong>{rangeLabel}</strong>
          <span>
            {updated
              ? `Updated ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Awaiting report data"}
          </span>
        </div>
        <div className="report-actions report-no-print">
          <button
            type="button"
            disabled={saving || sample}
            onClick={() => openAction("save")}
          >
            <Save size={15} /> Save report
          </button>
          <button
            type="button"
            disabled={saving || sample}
            onClick={() => openAction("schedule")}
          >
            <CalendarClock size={15} /> Schedule
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefresh((value) => value + 1)}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>
      <p className="report-applied-context">
        {filterFields
          .map(([field, label, key]) =>
            applied[field]
              ? `${label}: ${(options[key] || []).find((item) => String(item.value) === String(applied[field]))?.label || applied[field]}`
              : null,
          )
          .filter(Boolean)
          .join(" · ") ||
          "All agents, teams, priorities, categories, and channels"}
      </p>
      {message && (
        <p className="report-success" role="status">
          {message}
        </p>
      )}
      {action && (
        <form
          className="report-action-form report-no-print"
          onSubmit={saveAction}
        >
          <h3>
            {action === "schedule"
              ? "Schedule this report"
              : "Save this report"}
          </h3>
          <p>
            Uses the currently applied filters.
            {action === "schedule"
              ? ` Delivery timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}. Weekly delivery is Monday; monthly delivery is on the first.`
              : ""}
          </p>
          <div className="report-filter-grid">
            <label>
              Report name
              <input
                required
                maxLength={120}
                value={actionName}
                disabled={saving}
                onChange={(event) => setActionName(event.target.value)}
              />
            </label>
            {action === "schedule" && (
              <>
                <label>
                  Recipient email
                  <input
                    type="email"
                    required
                    value={email}
                    disabled={saving}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label>
                  Frequency
                  <select
                    value={frequency}
                    disabled={saving}
                    onChange={(event) => setFrequency(event.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
                <label>
                  Delivery time
                  <input
                    type="time"
                    required
                    value={time}
                    disabled={saving}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </label>
              </>
            )}
          </div>
          {actionError && (
            <p className="report-error" role="alert">
              {actionError}
            </p>
          )}
          <div className="report-actions">
            <button className="report-primary" disabled={saving} type="submit">
              {saving
                ? "Saving…"
                : action === "schedule"
                  ? "Create schedule"
                  : "Save report"}
            </button>
            <button
              disabled={saving}
              type="button"
              onClick={() => setAction("")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {error && (
        <div className="report-error report-load-error" role="alert">
          <strong>Report data could not be loaded</strong>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}
      <div className="report-kpis" aria-busy={loading}>
        {cards.map((card) => (
          <section className="report-kpi" key={card.title}>
            <div className="report-kpi__label">
              <span>{card.title}</span>
              <span className={`report-kpi__icon ${card.color}`}>
                <card.icon size={18} />
              </span>
            </div>
            <strong>{loading ? "…" : card.value}</strong>
            <p>{report ? card.detail : "Waiting for backend data"}</p>
          </section>
        ))}
      </div>
      <div className="report-secondary-metrics">
        <div>
          <span>Ticket backlog</span>
          <strong>{number(kpis.backlog)}</strong>
        </div>
        <div>
          <span>Avg. resolution time</span>
          <strong>{duration(kpis.avg_resolution_seconds)}</strong>
        </div>
        <div>
          <span>SLA compliance</span>
          <strong>{percent(kpis.sla_compliance_percent)}</strong>
        </div>
      </div>
      <div className="report-charts">
        {charts.map((chart) => (
          <ReportChart
            key={chart.key}
            chart={chart}
            data={report?.[chart.key] || []}
            loading={loading}
            sample={sample}
          />
        ))}
      </div>
      <p className="report-footnote">
        {sample && "Sample metrics use fictional tickets created in the selected period. CSAT counts positive responses among rated resolved tickets. Demo SLA measures resolved tickets with first response within 60 minutes and resolution within 480 minutes. Trend dates without feedback have no CSAT value. "}
        Metrics reflect the selected period and filters. Missing values are
        shown as —, never as zero. Download individual charts using the arrow in
        each chart header.
        </p>
    </div>
  );
}
