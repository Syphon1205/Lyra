import { IssuePanel } from "./IssuePanel/IssuePanel";

export function IssueWindow({ issueId }: { issueId: string }) {
  return (
    <div style={{ height: "100%" }}>
      <IssuePanel issueId={issueId} standalone />
    </div>
  );
}
