import { useEffect, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import styles from "./ReleasesView.module.css";

export function ReleasesView({ projectId }: { projectId: string }) {
  const releases = useLyraStore((s) => s.releases);
  const loadReleases = useLyraStore((s) => s.loadReleases);
  const createRelease = useLyraStore((s) => s.createRelease);

  const [modalOpen, setModalOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    void loadReleases(projectId);
  }, [projectId, loadReleases]);

  const handleCreate = async () => {
    if (!version.trim()) return;
    await createRelease({
      projectId,
      version: version.trim(),
      name: description.trim() || version.trim(),
      releaseDate: new Date().toISOString().split("T")[0],
    });
    setVersion("");
    setDescription("");
    setModalOpen(false);
  };

  return (
    <div className={`${styles.container} lyra-scroll`}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>
            <LyraIcon name="file" size={18} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>Releases</h2>
          </div>
        </div>

        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          <LyraIcon name="plus" size={13} style={{ strokeWidth: 2.2 }} />
          <span>New Release</span>
        </button>
      </div>

      <div className={styles.list}>
        {releases.map((rel, idx) => {
          const isReleased = rel.status === "released";
          const progress = isReleased ? 100 : idx === 0 ? 75 : 40;

          return (
            <div key={rel.id} className={styles.releaseCard}>
              <div className={styles.topRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={styles.versionBadge}>{rel.version}</span>
                  <span
                    className={`${styles.statusPill} ${
                      isReleased ? styles.statusReleased : styles.statusUnreleased
                    }`}
                  >
                    {isReleased ? "Released" : "In Progress"}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>
                  {rel.releaseDate || "Targeting Q4 2026"}
                </span>
              </div>

              <div style={{ fontSize: 13, color: "var(--lyra-text)" }}>
                {rel.description || "Milestone release containing core features and bugfixes."}
              </div>

              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${progress}%`,
                    background: isReleased ? "#10b981" : "var(--lyra-accent-solid)",
                  }}
                />
              </div>

              <div className={styles.bottomRow}>
                <span>{progress}% complete</span>
                <span>{isReleased ? "18 issues resolved" : "12 of 16 issues completed"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Create Release</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Version</label>
              <input
                autoFocus
                className={styles.input}
                placeholder="e.g. v1.1.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Description</label>
              <input
                className={styles.input}
                placeholder="Release notes / summary"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                style={{
                  background: "none",
                  border: "1px solid var(--lyra-border)",
                  padding: "6px 14px",
                  borderRadius: 6,
                  color: "var(--lyra-text)",
                  fontSize: 12.5,
                }}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button className={styles.newBtn} onClick={() => void handleCreate()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
