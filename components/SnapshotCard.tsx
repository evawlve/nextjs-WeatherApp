'use client';

import { useState } from 'react';
import styles from './SnapshotCard.module.css';

export interface SnapshotData {
  id: string;
  city: string;
  country: string;
  temp: number;
  description: string;
  icon: string;
  date: string;
  note?: string; // optional note field
}

interface Props {
  snapshot: SnapshotData;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newData: Partial<SnapshotData>) => Promise<void>;
}

export default function SnapshotCard({ snapshot, onDelete, onEdit }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(snapshot.note || ''); // Initialize with existing note or empty string

  if (!snapshot?.id) {
    console.warn("SnapshotCard rendered without valid snapshot data");
    return null;
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEdit = async () => {
    if (!onEdit) return;
    
    try {
      await onEdit(snapshot.id, { note: editedNote });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit snapshot:', error);
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''}`}>
        {/* Front of card */}
        <div className={styles.cardFront}>
          <h3>{snapshot.city || 'N/A'}, {snapshot.country || 'N/A'}</h3>
          <div className={styles.iconContainer}>
            <img
              src={`https://www.weatherbit.io/static/img/icons/${snapshot.icon}.png`}
              alt={snapshot.description}
              width={48}
              height={48}
            />
          </div>
          <div className={styles.infoContainer}>
            <p>{snapshot.description || 'No description'}</p>
            <p>Temperature 🌡: {snapshot.temp ?? 'N/A'}°C</p>
            <div>
              <p className={styles.dateLabel}>Date:</p>
              <p className={styles.dateValue}>{snapshot.date || 'N/A'}</p>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button 
              className={styles.deleteButton} 
              onClick={() => onDelete(snapshot.id)}
            >
              Delete
            </button>
            <button className={styles.flipCardButton} onClick={handleFlip}>
              Flip Card <img src="/flip.svg" alt="Flip card" />
            </button>
          </div>
        </div>

        {/* Back of card */}
        <div className={styles.cardBack}>
          {isEditing ? (
            <div className={styles.editForm}>
              <textarea
                className={styles.editInput}
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                placeholder="Add a note..."
              />
              <button className={styles.saveButton} onClick={handleEdit}>
                Save Note
              </button>
            </div>
          ) : (
            <div className={styles.noteView}>
              <h4>Personal Note:</h4>
              <p>{snapshot.note || 'No note added yet'}</p>
              <button onClick={() => setIsEditing(true)}>
                {snapshot.note ? 'Edit Note' : 'Add Note'}
              </button>
            </div>
          )}
          <button className={styles.backFlipButton} onClick={handleFlip}>
            Flip Card <img src="/flip.svg" alt="Flip card" />
          </button>
        </div>
      </div>
    </div>
  );
}
