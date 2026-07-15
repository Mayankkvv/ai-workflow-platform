import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getWorkflows,
  createWorkflow,
  renameWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  getRecentExecutions,
} from "../services/workflowService.js";
import useAuthStore from "../store/authStore.js";
import RenameModal from "../components/RenameModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EditDescriptionModal from "../components/EditDescriptionModal.jsx";
import { SkeletonLine } from "../components/Skeleton.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Sidebar, { MobileNav } from "../components/Sidebar.jsx";
import {
  Search,
  Plus,
  Pencil,
  Copy,
  Trash2,
  FileText,
  Workflow as WorkflowIcon,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Ban,
  Plug,
  Settings2,
  Rocket,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sublabel, accent }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center ${accent}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const STATUS_STYLES = {
  success: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
  failed: { icon: XCircle, color: "text-red-600 dark:text-red-400" },
  cancelled: { icon: Ban, color: "text-gray-400 dark:text-gray-500" },
};

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const toast = useToast();

  const [workflows, setWorkflows] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [descriptionTarget, setDescriptionTarget] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getWorkflows();
        setWorkflows(data.workflows);
      } catch (err) {
        toast.error("Could not load your workflows. Please try again.");
      } finally {
        setIsLoading(false);
      }

      try {
        const data = await getRecentExecutions();
        setRecentExecutions(data.executions);
      } catch (err) {
        // Non-critical — the dashboard is still fully usable without this.
      } finally {
        setIsLoadingActivity(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      const data = await createWorkflow("Untitled Workflow", "");
      setWorkflows((prev) => [data.workflow, ...prev]);
      toast.success("Workflow created");
    } catch (err) {
      toast.error("Could not create a new workflow. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameSave = async (newName) => {
    setIsProcessing(true);
    try {
      await renameWorkflow(renameTarget._id, newName);
      setWorkflows((prev) =>
        prev.map((w) =>
          w._id === renameTarget._id ? { ...w, name: newName } : w,
        ),
      );
      setRenameTarget(null);
      toast.success("Workflow renamed");
    } catch (err) {
      toast.error("Could not rename the workflow. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDescriptionSave = async (newDescription) => {
    setIsProcessing(true);
    try {
      await renameWorkflow(
        descriptionTarget._id,
        descriptionTarget.name,
        newDescription,
      );
      setWorkflows((prev) =>
        prev.map((w) =>
          w._id === descriptionTarget._id
            ? { ...w, description: newDescription }
            : w,
        ),
      );
      setDescriptionTarget(null);
      toast.success("Description updated");
    } catch (err) {
      toast.error("Could not update the description. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await deleteWorkflow(deleteTarget._id);
      setWorkflows((prev) => prev.filter((w) => w._id !== deleteTarget._id));
      setDeleteTarget(null);
      toast.success("Workflow deleted");
    } catch (err) {
      toast.error("Could not delete the workflow. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (workflow) => {
    setDuplicatingId(workflow._id);
    try {
      const data = await duplicateWorkflow(workflow._id);
      setWorkflows((prev) => [data.workflow, ...prev]);
      toast.success("Workflow duplicated");
    } catch (err) {
      toast.error("Could not duplicate the workflow. Please try again.");
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      w.name.toLowerCase().includes(term) ||
      (w.description || "").toLowerCase().includes(term)
    );
  });

  const activeCount = workflows.filter((w) => w.isActive).length;
  const successRate = recentExecutions.length
    ? Math.round(
        (recentExecutions.filter((e) => e.status === "success").length /
          recentExecutions.length) *
          100,
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <MobileNav />

      <main className="md:pl-64">
        <header className="hidden md:flex items-center justify-between px-8 h-16 sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your workflows..."
              className="w-full h-10 pl-9 pr-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
            {getInitials(user?.name)}
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Welcome back, {user?.name?.split(" ")[0]}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Here's what's happening with your workflows.
              </p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              disabled={isCreating}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {isCreating ? "Creating..." : "New Workflow"}
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
                >
                  <SkeletonLine className="h-3 w-20 mb-3" />
                  <SkeletonLine className="h-7 w-14" />
                </div>
              ))}
            </div>
          ) : workflows.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 md:p-8 mb-8">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                Get started
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
                Connect an app, build a workflow visually, then activate it to
                start automating.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {[
                  {
                    icon: Plug,
                    title: "Connect an app",
                    desc: "Authorize GitHub, Slack, Gmail, and more.",
                  },
                  {
                    icon: Settings2,
                    title: "Build the flow",
                    desc: "Drag nodes onto the canvas and connect them.",
                  },
                  {
                    icon: Rocket,
                    title: "Go live",
                    desc: "Toggle Active and trigger it via webhook.",
                  },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCreateWorkflow}
                disabled={isCreating}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create your first workflow"}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                  icon={WorkflowIcon}
                  label="Total Workflows"
                  value={workflows.length}
                  accent="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                  icon={Zap}
                  label="Active"
                  value={activeCount}
                  sublabel={`${workflows.length - activeCount} in draft`}
                  accent="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Success Rate"
                  value={successRate !== null ? `${successRate}%` : "—"}
                  sublabel={
                    recentExecutions.length
                      ? `last ${recentExecutions.length} runs`
                      : "no runs yet"
                  }
                  accent="bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Your Workflows
                </h2>
              </div>

              {filteredWorkflows.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  No workflows match "{searchTerm}".
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {filteredWorkflows.map((workflow) => (
                    <div key={workflow._id} className="group relative">
                      <Link
                        to={`/workflows/${workflow._id}`}
                        className={`block bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 ${
                          workflow.isActive
                            ? "border-l-green-500"
                            : "border-l-gray-300 dark:border-l-gray-700"
                        } hover:border-blue-400 hover:border-l-blue-400 transition-colors`}
                      >
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 pr-24 truncate">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {workflow.description || "No description"}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              workflow.isActive
                                ? "bg-green-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                          {workflow.isActive ? "Active" : "Draft"}
                        </p>
                      </Link>

                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setDescriptionTarget(workflow);
                          }}
                          title="Edit description"
                          className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDuplicate(workflow);
                          }}
                          disabled={duplicatingId === workflow._id}
                          title="Duplicate"
                          className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setRenameTarget(workflow);
                          }}
                          title="Rename"
                          className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteTarget(workflow);
                          }}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded bg-gray-50 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    Recent Activity
                  </h2>
                </div>

                {isLoadingActivity ? (
                  <div className="p-4 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <SkeletonLine key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : recentExecutions.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 p-4">
                    No executions yet — run a workflow to see activity here.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentExecutions.map((execution) => {
                      const style =
                        STATUS_STYLES[execution.status] || STATUS_STYLES.failed;
                      const StatusIcon = style.icon;
                      return (
                        <Link
                          key={execution._id}
                          to={`/workflows/${execution.workflowId?._id}/executions`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <StatusIcon
                              className={`w-4 h-4 shrink-0 ${style.color}`}
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-100 truncate">
                              {execution.workflowId?.name || "Deleted workflow"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-3">
                            {new Date(execution.createdAt).toLocaleString()}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {renameTarget && (
        <RenameModal
          currentName={renameTarget.name}
          onSave={handleRenameSave}
          onCancel={() => setRenameTarget(null)}
          isLoading={isProcessing}
        />
      )}

      {descriptionTarget && (
        <EditDescriptionModal
          currentDescription={descriptionTarget.description}
          onSave={handleDescriptionSave}
          onCancel={() => setDescriptionTarget(null)}
          isLoading={isProcessing}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete workflow?"
          message={`"${deleteTarget.name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isProcessing}
        />
      )}
    </div>
  );
}

export default DashboardPage;
