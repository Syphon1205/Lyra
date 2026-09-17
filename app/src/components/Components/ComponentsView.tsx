import { useEffect, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import { Avatar } from "../Avatar";
import styles from "./ComponentsView.module.css";

export function ComponentsView({ projectId }: { projectId: string }) {
  const components = useLyraStore((s) => s.components);
  const loadComponents = useLyraStore((s) => s.loadComponents);
  const createComponent = useLyraStore((s) => s.createComponent);
  const users = useLyraStore((s) => s.users);
  const issues = useLyraStore((s) => s.issues);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    void loadComponents(projectId);
  }, [projectId, loadComponents]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createComponent({ projectId, name: name.trim(), description: description.trim() });
    setName("");
    setDescription("");
    setModalOpen(false);
  };

  return (
    <div className={`${styles.container} lyra-scroll`}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconWrap}>
            <LyraIcon name="infrastructure" size={18} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>Components</h2>
          </div>
        </div>

        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          <LyraIcon name="plus" size={13} style={{ strokeWidth: 2.2 }} />
          <span>New Component</span>
        </button>
      </div>

      <div className={styles.grid}>
        {components.map((c, i) => {
          const lead = users[i % users.length];
          return (
            <div key={c.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.componentName}>{c.name}</span>
                <span style={{ fontSize: 11, color: "var(--lyra-text-muted)" }}>
                  {issues.length} issues
                </span>
              </div>
              <div className={styles.componentDesc}>
                {c.description || "No description provided for this component."}
              </div>
              <div className={styles.cardBottom}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {lead && <Avatar name={lead.name} colorSeed={lead.colorSeed} size={18} />}
                  <span>Lead: {lead?.name || "Tanner Davidson"}</span>
                </div>
                <span>Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Create Component</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Component Name</label>
              <input
                autoFocus
                className={styles.input}
                placeholder="e.g. Design Tokens"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, color: "var(--lyra-text-muted)" }}>Description</label>
              <input
                className={styles.input}
                placeholder="Brief summary of responsibility"
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
