import FullPlayerSheet from './FullPlayerSheet';

export default function MusicPanel(props) {
  return <FullPlayerSheet {...props} queue={props.queue ?? props.playlist ?? []} />;
}
