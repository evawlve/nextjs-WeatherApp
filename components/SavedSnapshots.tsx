// components/SavedSnapshots.tsx
'use client'; // Needs to be client to pass onClick down or if it uses hooks itself

import SnapshotCard, { SnapshotData } from './SnapshotCard';
import styles from './SavedSnapshots.module.css';

interface Props {
  snapshots: SnapshotData[];
  onDelete: (id: string) => void; // or Promise<void> if async
}

export default function SavedSnapshots({ snapshots, onDelete }: Props) {
  if (!snapshots || snapshots.length === 0) {
     return (
       <div>
         <h2 className={styles.title}>Saved Weather Snapshots</h2>
         <p>No snapshots saved yet.</p>
       </div>
     );
  }

  return (
    <div>
      <h2 className={styles.title}>Saved Weather Snapshots</h2>
      <div className={styles.grid}>
        {/* Render snapshots */}
        {snapshots.map((snap) => (
          // Ensure snap object has a unique 'id' property for the key
          <SnapshotCard key={snap.id} snapshot={snap} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

