'use client'; // CSR

import SnapshotCard, { SnapshotData } from './SnapshotCard';
import styles from './SavedSnapshots.module.css';

interface Props {
  snapshots: SnapshotData[];
  onDelete: (id: string) => void; 
}

export default function SavedSnapshots({ snapshots, onDelete }: Props) {
  if (!snapshots || snapshots.length === 0) {
     return (
       <div>
         <p>No snapshots saved yet.</p>
       </div>
     );
  }

  return (
    <div>
      <div className={styles.grid}>
        {/* Render snapshots */}
        {snapshots.map((snap) => (
          // Snap object has a unique id property for the key
          <SnapshotCard key={snap.id} snapshot={snap} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

