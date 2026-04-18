/**
 * Collaboration — Share dashboards, team invites, and comments on metrics.
 */
import { useState, useEffect } from "react";
import { Share2, Copy, Link2, MessageSquare, Users, Send, Trash2, CheckCircle2, X, ExternalLink } from "lucide-react";
import storage from "../services/storage";
import { useAuth } from "../context/AuthContext";

export default function Collaboration() {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState(() => storage.get("metric_comments", []));
  const [newComment, setNewComment] = useState("");
  const [commentMetric, setCommentMetric] = useState("General");
  const [teamMembers, setTeamMembers] = useState(() => storage.get("team_members", []));
  const [inviteEmail, setInviteEmail] = useState("");
  const [activeTab, setActiveTab] = useState("share");

  useEffect(() => { storage.set("metric_comments", comments); }, [comments]);
  useEffect(() => { storage.set("team_members", teamMembers); }, [teamMembers]);

  const generateShareLink = () => {
    const state = {
      kpis: storage.get("custom_kpis", []),
      widgets: storage.get("dashboard_widgets", {}),
      theme: localStorage.getItem("bizinsight-theme") || "beige",
    };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}/?shared=${encoded}`;
    setShareUrl(url);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now().toString(),
        metric: commentMetric,
        text: newComment,
        author: user?.displayName || "You",
        timestamp: new Date().toISOString(),
      },
      ...comments,
    ]);
    setNewComment("");
  };

  const deleteComment = (id) => setComments(comments.filter((c) => c.id !== id));

  const addTeamMember = () => {
    if (!inviteEmail.trim() || teamMembers.some((m) => m.email === inviteEmail)) return;
    setTeamMembers([
      ...teamMembers,
      { id: Date.now().toString(), email: inviteEmail, role: "viewer", status: "pending", addedAt: new Date().toISOString() },
    ]);
    setInviteEmail("");
  };

  const removeTeamMember = (id) => setTeamMembers(teamMembers.filter((m) => m.id !== id));

  const metricOptions = ["General", "Bitcoin Price", "Revenue", "Inventory", "Portfolio P&L", "Market Trends", "Sales Drop - April 3rd"];

  const tabs = [
    { id: "share", label: "Share", icon: Share2 },
    { id: "comments", label: "Comments", icon: MessageSquare, count: comments.length },
    { id: "team", label: "Team", icon: Users, count: teamMembers.length },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Collaboration</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Share dashboards, invite team members, and discuss metrics</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 animate-fade-in-up-delay-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
              style={{
                backgroundColor: activeTab === tab.id ? "var(--accent)" : "var(--bg-surface)",
                color: activeTab === tab.id ? "#fff" : "var(--text-secondary)",
                borderColor: activeTab === tab.id ? "transparent" : "var(--border-main)",
              }}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ backgroundColor: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "var(--bg-hover)", color: activeTab === tab.id ? "#fff" : "var(--text-muted)" }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Share Tab */}
      {activeTab === "share" && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Share Dashboard</h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>Generate a public link to share your dashboard configuration with investors, team members, or clients.</p>

            {!shareUrl ? (
              <button onClick={generateShareLink}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
                style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                <Link2 className="w-4 h-4" /> Generate Share Link
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl border text-xs font-mono truncate" style={{ backgroundColor: "var(--bg-input)", borderColor: "var(--border-main)", color: "var(--text-secondary)" }}>
                    {shareUrl}
                  </div>
                  <button onClick={copyLink}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all"
                    style={{ borderColor: copied ? "var(--accent-green)" : "var(--border-main)", color: copied ? "var(--accent-green)" : "var(--text-primary)" }}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <ExternalLink className="w-3 h-3" /> Anyone with this link can view your dashboard layout and KPIs
                </div>
                <button onClick={() => setShareUrl("")} className="text-xs font-medium" style={{ color: "var(--accent-red)" }}>Revoke link</button>
              </div>
            )}
          </div>

          {/* What gets shared */}
          <div className="rounded-2xl p-5 border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>What's included in shared link</h4>
            <div className="space-y-2">
              {[
                { emoji: "✅", text: "Custom KPI cards and values" },
                { emoji: "✅", text: "Dashboard widget layout" },
                { emoji: "✅", text: "Theme preference" },
                { emoji: "❌", text: "Portfolio holdings (private)" },
                { emoji: "❌", text: "Price alerts (private)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span>{item.emoji}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Metric Comments</h3>

            {/* Add comment */}
            <div className="space-y-3 mb-5">
              <select value={commentMetric} onChange={(e) => setCommentMetric(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                {metricOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="flex gap-2">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  placeholder="e.g., Why did sales drop on April 3rd?"
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
                <button onClick={addComment} disabled={!newComment.trim()}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments list */}
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No comments yet. Start a discussion about your metrics!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border group" style={{ borderColor: "var(--border-light)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.author}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>{c.metric}</span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.text}</p>
                        <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>{new Date(c.timestamp).toLocaleString()}</p>
                      </div>
                      <button onClick={() => deleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all" style={{ color: "var(--text-muted)" }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-5 animate-fade-in-up">
          <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-main)" }}>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Team Members</h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-secondary)" }}>Invite people to view your dashboard. They&apos;ll receive an email with access details.</p>

            {/* Invite */}
            <div className="flex gap-2 mb-5">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTeamMember()}
                placeholder="colleague@company.com"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: "var(--border-main)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />
              <button onClick={addTeamMember} disabled={!inviteEmail.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                Invite
              </button>
            </div>

            {/* Members list */}
            <div className="space-y-2">
              {/* Current user */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border" style={{ borderColor: "var(--border-light)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))" }}>
                    {(user?.displayName || "Y")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.displayName || "You"}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{user?.email || "owner"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "var(--accent)" }}>Owner</span>
              </div>

              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3.5 rounded-xl border group" style={{ borderColor: "var(--border-light)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-muted)" }}>
                      {member.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{member.email}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Invited {new Date(member.addedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-hover)", color: "var(--accent-gold)" }}>
                      {member.status}
                    </span>
                    <button onClick={() => removeTeamMember(member.id)} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: "var(--accent-red)" }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
