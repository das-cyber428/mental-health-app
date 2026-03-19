export default function YouTubePlayer({ hostRef }) {
  return (
    <div className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0">
      <div ref={hostRef} />
    </div>
  );
}
