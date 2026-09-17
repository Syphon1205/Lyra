import { ChatPanel } from "./Chat/ChatPanel";

export function ChatWindow({ sessionId }: { sessionId: string }) {
  return (
    <div style={{ height: "100%" }}>
      <ChatPanel sessionId={sessionId} standalone />
    </div>
  );
}
