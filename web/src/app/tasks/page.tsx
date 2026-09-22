"use client";

import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Phone,
  MessageSquare,
  Mail,
  Users,
  Clock,
  Trash2,
  Calendar,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Task } from "@/types/crm";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("Call");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createTask({
        title: taskTitle,
        type: taskType,
        priority: taskPriority,
        due_date: taskDueDate || undefined,
        status: "Pending",
      });
      setIsModalOpen(false);
      setTaskTitle("");
      fetchTasks();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.toggleTask(id);
      fetchTasks();
    } catch (err) {
      alert("Failed to toggle task");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      activeTab === "pending"
        ? t.status === "Pending"
        : t.status === "Completed";

    const matchesType =
      typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesStatus && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "call":
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case "whatsapp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-purple-600" />;
      case "meeting":
        return <Users className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Tasks & Follow-ups
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {tasks.filter((t) => t.status === "Pending").length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled calls, WhatsApp follow-ups, and sales action items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        {/* Pending vs Completed Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "pending"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending Actions ({tasks.filter((t) => t.status === "Pending").length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-white text-purple-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({tasks.filter((t) => t.status === "Completed").length})
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["all", "call", "whatsapp", "email", "meeting"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                typeFilter === type
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 bg-slate-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            Loading follow-up tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No tasks found in this view.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-purple-600 font-semibold hover:underline"
            >
              + Create a new task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      task.status === "Completed"
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-slate-300 hover:border-purple-500 text-transparent hover:text-purple-500"
                    }`}
                  >
                    ✓
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getTypeIcon(task.type)}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        task.status === "Completed"
                          ? "line-through text-slate-400"
                          : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-medium text-slate-600">
                        {task.type}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          Due: {task.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              Schedule Follow-up Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call to discuss GST invoice details"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Channel
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Call">Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
