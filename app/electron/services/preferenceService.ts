import type Database from "better-sqlite3";

export class PreferenceService {
  constructor(private db: Database.Database) {}

  get(key: string, defaultValue?: string): string | undefined {
    const row = this.db.prepare("SELECT value FROM preferences WHERE key = ?").get(key) as { value: string } | undefined;
    return row ? row.value : defaultValue;
  }

  getAll(): Record<string, string> {
    const rows = this.db.prepare("SELECT key, value FROM preferences").all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  }

  set(key: string, value: unknown): void {
    const serialized = typeof value === "string" ? value : String(value);
    this.db.prepare("INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)").run(key, serialized);
  }

  setMany(entries: Record<string, unknown>): void {
    const stmt = this.db.prepare("INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)");
    this.db.transaction(() => {
      for (const [key, value] of Object.entries(entries)) {
        const serialized = typeof value === "string" ? value : String(value);
        stmt.run(key, serialized);
      }
    })();
  }
}
