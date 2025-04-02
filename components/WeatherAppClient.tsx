// components/WeatherAppClient.tsx
'use client'; // This component needs client-side capabilities

import { useState } from 'react';
import WeatherSearch from './WeatherSearch';
import SavedSnapshots from './SavedSnapshots';
import type { SnapshotData } from './SnapshotCard';
import { collection, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from '@/lib/firebase';

interface Props {
  initialSnapshots: SnapshotData[];
}

export default function WeatherAppClient({ initialSnapshots }: Props) {
  // State is now managed here
  const [snapshots, setSnapshots] = useState<SnapshotData[]>(initialSnapshots);

  // Add/Delete functions are now defined here
  const addSnapshot = async (newSnapData: Omit<SnapshotData, 'id' | 'date'>) => {
    // Add the current date/time before saving
    const snapshotToSave = {
      ...newSnapData,
      // Use Firestore Timestamp for better sorting/querying,
      // or new Date() if you prefer JS Date (Firestore converts it)
      // date: Timestamp.now()
      date: new Date() // Will be stored as Timestamp by Firestore
    };

    try {
      const docRef = await addDoc(collection(db, 'snapshots'), snapshotToSave);
      // Update client state immediately for responsiveness
      setSnapshots((prev) => [
        ...prev,
        {
          ...snapshotToSave,
          id: docRef.id,
          date: snapshotToSave.date.toLocaleString(), // Convert date back to string for display state
        }
      ]);
       console.log('Snapshot saved!');
    } catch (error) {
       console.error('Failed to save snapshot:', error);
       // Optionally: Add user feedback for error
    }
  };

  const deleteSnapshot = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'snapshots', id)); // Use the specific ID
      // Update client state immediately
      setSnapshots((prev) => prev.filter((snap) => snap.id !== id));
       console.log('Snapshot deleted!');
    } catch (error) {
        console.error('Failed to delete snapshot:', error);
         // Optionally: Add user feedback for error
    }
  };

  return (
    <>
      {/* Pass the add function to WeatherSearch */}
      <WeatherSearch onSave={addSnapshot} />
      {/* Pass the current state and delete function to SavedSnapshots */}
      <SavedSnapshots snapshots={snapshots} onDelete={deleteSnapshot} />
    </>
  );
}