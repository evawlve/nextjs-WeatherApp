'use client';

import SnapshotCard, { SnapshotData } from './SnapshotCard';
import styles from './SavedSnapshots.module.css';

interface Props {
  snapshots: SnapshotData[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newData: Partial<SnapshotData>) => Promise<void>;
}

export default function SavedSnapshots({ snapshots, onDelete, onEdit }: Props) {
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
        {snapshots.map((snap) => (
          <SnapshotCard 
            key={snap.id} 
            snapshot={snap} 
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}

