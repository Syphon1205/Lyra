import { useEffect, useState } from "react";
import { useLyraStore } from "../../state/store";
import { LyraIcon } from "../../icons/LyraIcon";
import styles from "./PagesView.module.css";

export function PagesView({ projectId }: { projectId: string }) {
  const pages = useLyraStore((s) => s.pages);
  const loadPages = useLyraStore((s) => s.loadPages);
  const createPage = useLyraStore((s) => s.createPage);
  const updatePage = useLyraStore((s) => s.updatePage);
  const deletePage = useLyraStore((s) => s.deletePage);

  const [selectedId, setSelectedId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    void loadPages(projectId);
  }, [projectId, loadPages]);

  useEffect(() => {
    if (pages.length > 0 && (!selectedId || !pages.find((p) => p.id === selectedId))) {
      const first = pages[0];
      if (first) {
        setSelectedId(first.id);
        setTitle(first.title);
        setContent(first.content);
      }
    }
  }, [pages, selectedId]);

  const activePage = pages.find((p) => p.id === selectedId);

  const handleSelectPage = (id: string) => {
    const p = pages.find((x) => x.id === id);
    if (!p) return;
    setSelectedId(id);
    setTitle(p.title);
    setContent(p.content);
  };

  const handleCreateNew = async () => {
    await createPage({
      projectId,
      title: "Untitled Page",
      body: "# New Page\n\nStart writing documentation or project notes here...",
    });
  };

  const handleTitleBlur = () => {
    if (!selectedId || !title.trim()) return;
    void updatePage(selectedId, { title: title.trim() });
  };

  const handleContentBlur = () => {
    if (!selectedId) return;
    void updatePage(selectedId, { body: content });
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (confirm("Delete this page?")) {
      await deletePage(selectedId);
      setSelectedId("");
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Pages Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <LyraIcon name="document" size={14} />
            <span>Pages</span>
          </div>
          <button className={styles.addBtn} onClick={() => void handleCreateNew()} title="New Page">
            <LyraIcon name="plus" size={13} style={{ strokeWidth: 2.2 }} />
          </button>
        </div>

        <div className={styles.pageList}>
          {pages.map((page) => (
            <div
              key={page.id}
              className={`${styles.pageItem} ${page.id === selectedId ? styles.pageItemActive : ""}`}
              onClick={() => handleSelectPage(page.id)}
            >
              <LyraIcon name="file" size={13} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {page.title || "Untitled"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Main Canvas */}
      {activePage ? (
        <div className={styles.editorArea}>
          <div className={styles.editorHeader}>
            <span style={{ fontSize: 11.5, color: "var(--lyra-text-muted)" }}>
              Updated {new Date(activePage.updatedAt).toLocaleDateString()}
            </span>
            <button className={styles.deleteBtn} onClick={() => void handleDelete()}>
              <LyraIcon name="close" size={12} />
              <span>Delete</span>
            </button>
          </div>

          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Page Title"
          />

          <textarea
            className={styles.contentInput}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="Write markdown content here..."
          />
        </div>
      ) : (
        <div style={{ padding: 40, color: "var(--lyra-text-muted)" }}>
          No page selected. Click + to create a page.
        </div>
      )}
    </div>
  );
}
