
import { useCallback, useEffect, useState } from "react";
import {
  Activity, CalendarDays, ChartNoAxesCombined, Clock3,
  Droplet, Edit2, HeartPulse, LogOut, Plus, RefreshCw,
  Save, Trash2, X
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const SLOTS = [
  { value: "MORNING", label: "Morning (fasting)" },
  { value: "AFTER_BREAKFAST", label: "After breakfast" },
  { value: "AFTER_LUNCH", label: "After lunch" },
  { value: "AFTER_DINNER", label: "After dinner" },
];

const getToday = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const emptyForm = { date: getToday(), slot: "MORNING", value: "" };

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const getSlotLabel = (slot) =>
  SLOTS.find((item) => item.value === slot)?.label || slot;

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [reportType, setReportType] = useState("daily");
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState({
    highest: null, lowest: null, average: null, count: 0,
  });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = {
        daily: "/reports/daily",
        mtd: "/reports/month-to-date",
        monthly: "/reports/monthly",
      }[reportType];

      const [reportResponse, readingsResponse] = await Promise.all([
        api.get(endpoint, { params: { date: selectedDate } }),
        api.get("/readings", { params: { date: selectedDate } }),
      ]);

      const reportData = reportResponse.data.data?.report || reportResponse.data.data || {};
      const readingData = readingsResponse.data.data?.readings
        || readingsResponse.data.data || [];

      setReadings(Array.isArray(reportData.readings) ? reportData.readings : readingData);
      setStats(reportData.statistics || reportData.stats || {
  highest: null,
  lowest: null,
  average: null,
  count: 0,
});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your readings.");
      setReadings([]);
      setStats({ highest: null, lowest: null, average: null, count: 0 });
    } finally {
      setLoading(false);
    }
  }, [reportType, selectedDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const resetForm = () => {
    setForm({ ...emptyForm, date: selectedDate });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        date: form.date,
        slot: form.slot,
        value: Number(form.value),
      };

      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
        setSuccess("Reading updated successfully.");
      } else {
        await api.post("/readings", payload);
        setSuccess("Reading added successfully.");
      }

      resetForm();
      await fetchReport();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save reading.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reading) => {
    setForm({
      date: reading.date?.slice(0, 10) || selectedDate,
      slot: reading.slot,
      value: String(reading.value),
    });
    setEditingId(reading.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/readings/${id}`);
      setSuccess("Reading deleted successfully.");
      await fetchReport();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete reading.");
    }
  };

  const reportLabels = {
    daily: "Daily report",
    mtd: "Month to date",
    monthly: "Previous month",
  };

  const summaryCards = [
    { label: "Highest reading", value: stats.highest, icon: ChartNoAxesCombined, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Lowest reading", value: stats.lowest, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Average reading", value: stats.average, icon: Droplet, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total readings", value: stats.count ?? 0, icon: CalendarDays, color: "text-amber-600", bg: "bg-amber-50", unit: "records" },
  ];

  const chartData = [...readings]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((reading) => ({
      name: getSlotLabel(reading.slot),
      value: reading.value,
    }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <HeartPulse size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Sweety</h1>
              <p className="text-xs text-slate-500">Blood Glucose Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-medium text-indigo-600">Your health overview</p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Hello, {user?.name?.split(" ")[0] || "there"} 👋
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Keep track of your glucose readings in one place.
            </p>
          </div>

          <button
            onClick={() => {
              setForm({ ...emptyForm, date: selectedDate });
              setEditingId(null);
              setShowForm(true);
              setError("");
              setSuccess("");
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Plus size={18} /> Add reading
          </button>
        </div>

        {(error || success) && (
          <div
            role="alert"
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <section className="mb-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Glucose summary</h3>
              <p className="text-sm text-slate-500">{reportLabels[reportType]}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                {[
                  ["daily", "Daily"],
                  ["mtd", "Month to date"],
                  ["monthly", "Previous month"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setReportType(value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      reportType === value
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <input
                type="date"
                value={selectedDate}
                max={getToday()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
                aria-label="Select report date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <div className={`rounded-xl p-2.5 ${card.bg}`}>
                      <Icon size={19} className={card.color} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                      {card.value ?? "—"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {card.unit || (card.value !== null ? "mg/dL" : "")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {showForm && (
          <section className="mb-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  {editingId ? "Edit glucose reading" : "Add glucose reading"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Enter your reading details below.
                </p>
              </div>
              <button onClick={resetForm} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close form">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  required
                  max={getToday()}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Time slot</label>
                <select
                  value={form.slot}
                  onChange={(e) => setForm({ ...form, slot: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  {SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Glucose value (mg/dL)</label>
                <input
                  type="number"
                  required
                  min="40"
                  max="600"
                  step="1"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder="e.g. 110"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Save size={17} /> {saving ? "Saving..." : editingId ? "Update" : "Save reading"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-3 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Reading history</h3>
                <p className="mt-1 text-xs text-slate-500">{reportLabels[reportType]}</p>
              </div>
              <button
                onClick={fetchReport}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600"
                title="Refresh readings"
              >
                <RefreshCw size={17} />
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-48 items-center justify-center text-sm text-slate-400">
                Loading readings...
              </div>
            ) : readings.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <div className="mb-3 rounded-2xl bg-indigo-50 p-4 text-indigo-500">
                  <Droplet size={25} />
                </div>
                <p className="font-semibold text-slate-700">No readings found</p>
                <p className="mt-1 text-sm text-slate-400">
                  Add a glucose reading to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {readings.map((reading) => (
                  <div key={reading.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                        <Droplet size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{getSlotLabel(reading.slot)}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <Clock3 size={12} /> {formatDate(reading.date.slice(0, 10))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{reading.value}</p>
                        <p className="text-xs text-slate-400">mg/dL</p>
                      </div>
                      <button
                        onClick={() => handleEdit(reading)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        title="Edit reading"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(reading.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete reading"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
            <div className="mb-6">
              <h3 className="font-bold text-slate-900">Reading overview</h3>
              <p className="mt-1 text-xs text-slate-500">Glucose values in mg/dL</p>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">Loading chart...</div>
            ) : chartData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
                <ChartNoAxesCombined size={30} className="mb-3" />
                <p className="text-sm">Your chart will appear here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glucoseFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2ff" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#glucoseFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>

        <footer className="mt-10 pb-4 text-center text-xs text-slate-400">
          Sweety · Blood Glucose Tracker · Your health, your data.
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
