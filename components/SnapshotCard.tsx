//CSR inherited from SavedSnapshots
import styles from './SnapshotCard.module.css';

export interface SnapshotData {
  id: string; // Must have ID
  city: string;
  country: string;
  temp: number;
  description: string;
  icon: string;
  date: string; // Ensure date is a string 
}

interface Props {
  snapshot: SnapshotData;
  onDelete: (id: string) => void; 
}

export default function SnapshotCard({ snapshot, onDelete }: Props) {
  // Check for valid snapshot data
  if (!snapshot?.id) {
    console.warn("SnapshotCard rendered without valid snapshot data");
    return null; // Don't render if data is incomplete
  }

  return (
    <div className={styles.card}>
      <img
        src={`https://www.weatherbit.io/static/img/icons/${snapshot.icon}.png`}
        alt={snapshot.description}
        width={48}
        height={48}
      />
      {/* Check if properties exist, or displays 'N/A' */}
      <h3>{snapshot.city || 'N/A'}, {snapshot.country || 'N/A'}</h3>
      <p>{snapshot.description || 'No description'}</p>
      <p>Temperature 🌡: {snapshot.temp ?? 'N/A'}°C</p>
      {/* Display the string date */}
      <p>Date: {snapshot.date || 'N/A'}</p>
      <button onClick={() => onDelete(snapshot.id)}>Delete</button>
    </div>
  );
}