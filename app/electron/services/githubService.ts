import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import { shell } from "electron";

const execFileAsync = promisify(execFile);

export interface GitHubUserProfile {
  login: string;
  name: string;
  avatar_url: string;
  company?: string;
  bio?: string;
  html_url: string;
  public_repos: number;
}

export interface GitHubRepo {
  nameWithOwner: string;
  name: string;
  description: string;
  url: string;
  isPrivate: boolean;
  defaultBranchRef?: {
    name: string;
  };
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  url: string;
  headRefName: string;
  baseRefName: string;
}

const COMMON_GH_PATHS = [
  "/opt/homebrew/bin/gh",
  "/usr/local/bin/gh",
  "/usr/bin/gh",
];

export class GitHubService {
  private ghPath: string | null = null;

  async resolveGh(): Promise<string | null> {
    if (this.ghPath && fs.existsSync(this.ghPath)) return this.ghPath;

    for (const p of COMMON_GH_PATHS) {
      if (fs.existsSync(p)) {
        this.ghPath = p;
        return p;
      }
    }

    try {
      const { stdout } = await execFileAsync("/usr/bin/which", ["gh"], { encoding: "utf8" });
      const trimmed = stdout.trim();
      if (trimmed && fs.existsSync(trimmed)) {
        this.ghPath = trimmed;
        return trimmed;
      }
    } catch {
      // not found
    }

    return null;
  }

  async detect(): Promise<{ installed: boolean; path?: string; version?: string }> {
    const gh = await this.resolveGh();
    if (!gh) return { installed: false };

    try {
      const { stdout } = await execFileAsync(gh, ["--version"], { encoding: "utf8" });
      const firstLine = stdout.split("\n")[0]?.trim();
      return { installed: true, path: gh, version: firstLine };
    } catch {
      return { installed: false };
    }
  }

  async status(): Promise<{
    installed: boolean;
    path?: string;
    version?: string;
    authenticated: boolean;
    user: GitHubUserProfile | null;
    scopes?: string[];
  }> {
    const det = await this.detect();
    if (!det.installed) {
      return { installed: false, authenticated: false, user: null };
    }
    const auth = await this.getAuthStatus();
    return {
      installed: true,
      path: det.path,
      version: det.version,
      authenticated: auth.authenticated,
      user: auth.user,
      scopes: auth.scopes,
    };
  }

  async listRepos(): Promise<GitHubRepo[]> {
    return this.listRepositories();
  }

  async getAuthStatus(): Promise<{
    authenticated: boolean;
    user: GitHubUserProfile | null;
    scopes?: string[];
  }> {
    const gh = await this.resolveGh();
    if (!gh) return { authenticated: false, user: null };

    try {
      // Inspect authentication state with supported CLI commands
      const statusResult = await execFileAsync(gh, ["auth", "status"], { encoding: "utf8" });
      const statusOutput = (statusResult.stdout || "") + (statusResult.stderr || "");

      const scopesMatch = statusOutput.match(/Token scopes: ([^\n]+)/);
      const scopes = scopesMatch ? scopesMatch[1]?.replace(/'/g, "").split(",").map((s) => s.trim()) : [];

      // Fetch user profile via gh api user
      const userResult = await execFileAsync(gh, ["api", "user"], { encoding: "utf8" });
      const user = JSON.parse(userResult.stdout.trim()) as GitHubUserProfile;

      return {
        authenticated: true,
        user: {
          login: user.login,
          name: user.name || user.login,
          avatar_url: user.avatar_url,
          company: user.company,
          bio: user.bio,
          html_url: user.html_url,
          public_repos: user.public_repos ?? 0,
        },
        scopes,
      };
    } catch (e: any) {
      // If auth status fails with exit code 1 or not logged in
      return { authenticated: false, user: null };
    }
  }

  async listRepositories(): Promise<GitHubRepo[]> {
    const gh = await this.resolveGh();
    if (!gh) return [];

    try {
      const { stdout } = await execFileAsync(
        gh,
        ["repo", "list", "--limit", "30", "--json", "nameWithOwner,name,description,url,isPrivate,defaultBranchRef"],
        { encoding: "utf8" }
      );
      return JSON.parse(stdout.trim()) as GitHubRepo[];
    } catch {
      return [];
    }
  }

  async listPullRequests(repoFullName: string): Promise<GitHubPR[]> {
    const gh = await this.resolveGh();
    if (!gh) return [];

    try {
      const { stdout } = await execFileAsync(
        gh,
        ["pr", "list", "--repo", repoFullName, "--limit", "20", "--json", "number,title,state,url,headRefName,baseRefName"],
        { encoding: "utf8" }
      );
      return JSON.parse(stdout.trim()) as GitHubPR[];
    } catch {
      return [];
    }
  }

  async login(): Promise<{ success: boolean; error?: string }> {
    const gh = await this.resolveGh();
    if (!gh) return { success: false, error: "GitHub CLI (gh) is not installed." };

    try {
      // Launch web browser auth flow through gh
      shell.openExternal("https://github.com/login/device");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: String(e.message ?? e) };
    }
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    const gh = await this.resolveGh();
    if (!gh) return { success: false, error: "GitHub CLI (gh) is not installed." };

    try {
      await execFileAsync(gh, ["auth", "logout", "-h", "github.com", "-y"], { encoding: "utf8" });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: String(e.message ?? e) };
    }
  }

  async openInBrowser(url: string): Promise<void> {
    if (url.startsWith("https://github.com/") || url.startsWith("http://github.com/")) {
      await shell.openExternal(url);
    }
  }
}
