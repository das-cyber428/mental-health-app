import MessageBubble from './MessageBubble';

export default function ChatContainer({ messages, scrollRef }) {
  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-[24px] border border-white/8 bg-[rgba(8,12,24,0.82)] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:px-4"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
