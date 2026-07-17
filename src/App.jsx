import { useMemo, useState } from "react";
import { AlertCircle, Play, X } from "lucide-react";
import { ArticleWorkbench } from "./components/ArticleWorkbench.jsx";
import { ClusterInspector } from "./components/ClusterInspector.jsx";
import { EvidenceMap } from "./components/EvidenceMap.jsx";
import { ReplayRail } from "./components/ReplayRail.jsx";
import { ReplayReport } from "./components/ReplayReport.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { SourcesPanel } from "./components/SourcesPanel.jsx";
import { demoAnalysis, demoDraft, demoReplay, demoWorkspace } from "./data/demoWorkspace.js";
import { postJson } from "./lib/api.js";
import { exportMarkdown, parseDocumentFile, parseTicketsFile } from "./lib/fileParsers.js";

const INITIAL_SOURCE_META = {
  ticketName: "tickets.csv (SaaS demo)",
  mode: "demo",
};

function ErrorBanner({ error, onClose }) {
  if (!error) return null;
  return (
    <div className="error-banner" role="alert">
      <AlertCircle size={19} strokeWidth={1.9} />
      <div><strong>{error.code?.replaceAll("_", " ") || "Something went wrong"}</strong><span>{error.message}</span></div>
      <button className="icon-button" onClick={onClose} aria-label="Dismiss error"><X size={18} /></button>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState("radar");
  const [workspace, setWorkspace] = useState(demoWorkspace);
  const [sourceMeta, setSourceMeta] = useState(INITIAL_SOURCE_META);
  const [analysis, setAnalysis] = useState(demoAnalysis);
  const [selectedClusterId, setSelectedClusterId] = useState(demoAnalysis.clusters[0].clusterId);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [markdown, setMarkdown] = useState("");
  const [replay, setReplay] = useState(null);
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const selectedCluster = useMemo(
    () => selectedClusterId === null
      ? null
      : analysis?.clusters.find((cluster) => cluster.clusterId === selectedClusterId) || analysis?.clusters[0] || null,
    [analysis, selectedClusterId],
  );
  const selectedTickets = useMemo(
    () => analysis?.tickets.filter((ticket) => ticket.clusterId === selectedCluster?.clusterId) || [],
    [analysis, selectedCluster],
  );
  const selectedTicket = analysis?.tickets.find((ticket) => ticket.id === selectedTicketId) || null;

  const showError = (caught) => {
    setError({ code: caught.code || "WORKFLOW_ERROR", message: caught.message || "The workflow could not be completed." });
  };

  const chooseCluster = (clusterId) => {
    if (clusterId !== selectedClusterId) {
      setSelectedClusterId(clusterId);
      setSelectedTicketId(null);
      setDraft(null);
      setMarkdown("");
      setReplay(null);
    }
  };

  const loadDemo = () => {
    setWorkspace(demoWorkspace);
    setSourceMeta(INITIAL_SOURCE_META);
    setAnalysis(demoAnalysis);
    setSelectedClusterId(demoAnalysis.clusters[0].clusterId);
    setSelectedTicketId(null);
    setDraft(null);
    setMarkdown("");
    setReplay(null);
    setError(null);
  };

  const handleTicketsFile = async (file) => {
    setBusy("parsing");
    setError(null);
    try {
      const tickets = await parseTicketsFile(file);
      setWorkspace({ tickets, documents: [] });
      setSourceMeta({ ticketName: file.name, mode: "custom" });
      setAnalysis(null);
      setSelectedClusterId(null);
      setDraft(null);
      setReplay(null);
    } catch (caught) {
      showError(caught);
    } finally {
      setBusy(null);
    }
  };

  const handleDocumentFiles = async (files) => {
    setBusy("parsing");
    setError(null);
    try {
      const parsed = [];
      for (const file of files) parsed.push(await parseDocumentFile(file));
      setWorkspace((current) => {
        const existingDocuments = sourceMeta.mode === "demo" ? [] : current.documents;
        const byName = new Map(existingDocuments.map((document) => [document.name, document]));
        for (const document of parsed) byName.set(document.name, document);
        return { ...current, documents: Array.from(byName.values()).slice(0, 12) };
      });
      setSourceMeta((current) => ({ ...current, mode: "custom" }));
    } catch (caught) {
      showError(caught);
    } finally {
      setBusy(null);
    }
  };

  const analyze = async () => {
    setBusy("analyzing");
    setError(null);
    try {
      const result = await postJson("/api/analyze", workspace);
      setAnalysis(result);
      setSelectedClusterId(result.clusters[0]?.clusterId ?? null);
      setSelectedTicketId(null);
      setDraft(null);
      setMarkdown("");
      setReplay(null);
      setActiveView("radar");
    } catch (caught) {
      showError(caught);
    } finally {
      setBusy(null);
    }
  };

  const draftPatch = async () => {
    if (!selectedCluster) return;
    if (draft?.clusterId === selectedCluster.clusterId) {
      setWorkbenchOpen(true);
      return;
    }
    if (!selectedCluster.safeToDraft) {
      const blockingConflicts = selectedCluster.conflicts?.length
        ? selectedCluster.conflicts
        : ["The supplied evidence does not support one consistent policy."];
      const reviewMarkdown = [
        `# Policy decision needed: ${selectedCluster.label}`,
        "",
        "## Conflicting evidence",
        ...blockingConflicts.map((conflict) => `- ${conflict}`),
        "",
        "## Subject-matter expert decision",
        "- Confirm the authoritative policy and effective date.",
        "- Identify which customer segments or plans the rule applies to.",
        "- Replace or retire the conflicting source before publishing.",
      ].join("\n");
      setDraft({
        clusterId: selectedCluster.clusterId,
        safeToDraft: false,
        title: `Policy decision needed: ${selectedCluster.label}`,
        summary: "Support outcomes and current documentation disagree, so an article cannot be safely drafted yet.",
        markdown: reviewMarkdown,
        sourceBasis: [selectedCluster.bestSource],
        blockingConflicts,
        unansweredQuestions: ["Which policy is authoritative?", "Who owns the approval decision?"],
      });
      setMarkdown(reviewMarkdown);
      setReplay(null);
      setWorkbenchOpen(true);
      return;
    }
    if (analysis?.workspaceId === "demo-saas-support" && selectedCluster.clusterId === 0) {
      const nextDraft = { ...demoDraft, clusterId: selectedCluster.clusterId };
      setDraft(nextDraft);
      setMarkdown(nextDraft.markdown);
      setReplay(null);
      setWorkbenchOpen(true);
      return;
    }
    setBusy("drafting");
    setError(null);
    setWorkbenchOpen(true);
    setDraft(null);
    try {
      const result = await postJson("/api/draft", {
        cluster: selectedCluster,
        tickets: selectedTickets,
        documents: workspace.documents,
      });
      const nextDraft = { ...result, clusterId: selectedCluster.clusterId };
      setDraft(nextDraft);
      setMarkdown(result.markdown);
    } catch (caught) {
      setWorkbenchOpen(false);
      showError(caught);
    } finally {
      setBusy(null);
    }
  };

  const replayPatch = async () => {
    if (!selectedCluster || !draft) return;
    if (
      analysis?.workspaceId === "demo-saas-support"
      && selectedCluster.clusterId === 0
      && markdown === demoDraft.markdown
    ) {
      setReplay(demoReplay);
      return;
    }
    setBusy("replaying");
    setError(null);
    try {
      const result = await postJson("/api/replay", {
        cluster: selectedCluster,
        tickets: selectedTickets,
        documents: workspace.documents,
        markdown,
      });
      setReplay(result);
    } catch (caught) {
      showError(caught);
    } finally {
      setBusy(null);
    }
  };

  const openReplayReport = () => setActiveView("replay");
  const heading = activeView === "radar"
    ? "Test your documentation against real customer questions."
    : activeView === "sources"
      ? "Build a test suite from support evidence."
      : "Inspect every question before and after the patch.";

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onChange={setActiveView} model={analysis?.models?.model} />
      <main className="app-main">
        <header className="page-header">
          <h1>{heading}</h1>
          {activeView === "radar" ? (
            <button className="primary-button header-action" onClick={draftPatch} disabled={!selectedCluster || busy === "drafting"}>
              <Play size={20} strokeWidth={1.8} />
              Run knowledge replay
            </button>
          ) : null}
        </header>

        <ErrorBanner error={error} onClose={() => setError(null)} />

        {activeView === "radar" ? (
          <div className="radar-stage">
            <EvidenceMap
              clusters={analysis?.clusters || []}
              tickets={analysis?.tickets || []}
              selectedClusterId={selectedCluster?.clusterId}
              selectedTicketId={selectedTicketId}
              onSelectCluster={chooseCluster}
              onSelectTicket={setSelectedTicketId}
            />
            <ClusterInspector
              cluster={selectedCluster}
              selectedTicket={selectedTicket}
              busy={busy === "drafting"}
              onClose={() => setSelectedClusterId(null)}
              onDraft={draftPatch}
              onInspect={openReplayReport}
            />
            <ReplayRail cluster={selectedCluster} replay={replay} />
          </div>
        ) : null}

        {activeView === "sources" ? (
          <SourcesPanel
            workspace={workspace}
            sourceMeta={sourceMeta}
            busy={Boolean(busy)}
            onTicketsFile={handleTicketsFile}
            onDocumentFiles={handleDocumentFiles}
            onAnalyze={analyze}
            onLoadDemo={loadDemo}
          />
        ) : null}

        {activeView === "replay" ? (
          <ReplayReport
            cluster={selectedCluster}
            tickets={selectedTickets}
            replay={replay}
            onBack={() => setActiveView("radar")}
            onDraft={draftPatch}
          />
        ) : null}
      </main>

      <ArticleWorkbench
        open={workbenchOpen}
        cluster={selectedCluster}
        draft={draft}
        markdown={markdown}
        replay={replay}
        busy={busy === "drafting" || busy === "replaying"}
        onChange={setMarkdown}
        onClose={() => setWorkbenchOpen(false)}
        onReplay={replayPatch}
        onExport={() => exportMarkdown(draft?.title || selectedCluster?.label || "support-gap-patch", markdown)}
      />
    </div>
  );
}
