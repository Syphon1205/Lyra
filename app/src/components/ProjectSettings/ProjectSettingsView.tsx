import { useState } from "react";
import { useLyraStore } from "../../state/store";
import styles from "./ProjectSettingsView.module.css";

export function ProjectSettingsView({ projectId }: { projectId: string }) {
  const project = useLyraStore((s) => s.projects.find((p) => p.id === projectId));
  const updateProject = useLyraStore((s) => s.updateProject);
  const repositories = useLyraStore((s) => s.repositories);

  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.summary ?? "");
  const [saved, setSaved] = useState(false);

  if (!project) return null;

  const handleSave = async () => {
    await updateProject(projectId, { name, description });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`${styles.container} lyra-scroll`}>
      <h2 className={styles.title}>Project Settings</h2>

      <div className={styles.card}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Project Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Summary / Description</label>
          <input
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Associated Repository</label>
          <div className={styles.desc}>
            Linked to local repository: {repositories[0]?.name || "lyra"} ({repositories[0]?.localPath || "~/.lyra/repo"})
          </div>
        </div>

        <button className={styles.saveBtn} onClick={() => void handleSave()}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
