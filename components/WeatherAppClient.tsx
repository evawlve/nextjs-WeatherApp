// components/WeatherAppClient.tsx
'use client';

import styles from './WeatherAppClient.module.css';
import { useState, useEffect } from 'react';
import WeatherSearch from './WeatherSearch';
import SavedSnapshots from './SavedSnapshots';
import type { SnapshotData } from './SnapshotCard';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  Timestamp, 
  getDocs, 
  query, 
  orderBy,
  updateDoc 
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { db, app } from '@/lib/firebase';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Helper function to serialize Firestore date
function serializeFirestoreDate(date: any) {
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleString();
    }
    if (date instanceof Date) {
      return date.toLocaleString(); // Already a JS Date, convert to string
    }
    // Handle cases where date might already be a string or null/undefined
    return date ? String(date) : new Date().toLocaleString(); // Fallback if needed
}

export default function WeatherAppClient() {
  // Initialize user as null
  const [user, setUser] = useState<User | null>(null);
  // Initialize snapshots state as empty
  const [snapshots, setSnapshots] = useState<SnapshotData[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  // Add loading state for user's snapshots
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  // Add state for fetch errors
  const [snapshotError, setSnapshotError] = useState<string | null>(null);


  // Fetch User-Specific Snapshots function
  const fetchUserSnapshots = async (userId: string) => {
      if (!userId) return; 

      setSnapshotsLoading(true);
      setSnapshotError(null);
      setSnapshots([]);

      try {
          const userSnapshotsCol = collection(db, 'users', userId, 'snapshots');
          const q = query(userSnapshotsCol, orderBy("date", "desc"));

          const snapshotDocs = await getDocs(q);

          const userSnapshotData = snapshotDocs.docs.map((doc) => {
              const data = doc.data();
              return {
                  id: doc.id,
                  city: data.city,
                  country: data.country,
                  temp: data.temp,
                  description: data.description,
                  icon: data.icon,
                  date: serializeFirestoreDate(data.date),
                  note: data.note || '', // Add this line to include the note
              } as SnapshotData;
          });
          setSnapshots(userSnapshotData);

      } catch (error) {
          console.error("Error fetching user snapshots:", error);
          setSnapshotError("Failed to load saved snapshots.");
          setSnapshots([]);
      } finally {
          setSnapshotsLoading(false);
      }
  };


  // Listener for Auth State Changes
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // If user logs IN, fetch their specific snapshots
        fetchUserSnapshots(currentUser.uid);
      } else {
        // If user logs OUT, clear the snapshots
        setSnapshots([]);
        setSnapshotError(null); // Clear any errors
      }
    });
    return () => unsubscribe();
  }, []); // Empty dependency array


  // Sign-In / Sign-Out Functions
  const signInWithGoogle = async () => {
    try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google:", error);
      }
  };

  const signOutUser = async () => {
    try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out:", error);
      }
  };

  // Edit function for snapshots
  const editSnapshot = async (id: string, newData: Partial<SnapshotData>) => {
    if (!user) {
      console.error("Attempted to edit snapshot while logged out");
      return;
    }

    const snapshotDocRef = doc(db, 'users', user.uid, 'snapshots', id);

    try {
      await updateDoc(snapshotDocRef, newData);
      // Update client state
      setSnapshots((prev) => 
        prev.map((snap) => 
          snap.id === id ? { ...snap, ...newData } : snap
        )
      );
      console.log('Snapshot updated successfully');
    } catch (error) {
      console.error('Failed to update snapshot:', error);
      throw error;
    }
  };

  // Modified Add/Delete Functions (Use User ID in Path) 
  const addSnapshot = async (newSnapData: Omit<SnapshotData, 'id' | 'date'>) => {
    if (!user) {
      alert("Please sign in to save snapshots.");
      return;
    }
    const userSnapshotsCol = collection(db, 'users', user.uid, 'snapshots');

    const snapshotToSave = {
      ...newSnapData,
      date: Timestamp.now(),
      note: '' // Initialize with empty note
    };

    try {
      const docRef = await addDoc(userSnapshotsCol, snapshotToSave);
      setSnapshots((prev) => [
        {
          ...snapshotToSave,
          id: docRef.id,
          date: snapshotToSave.date.toDate().toLocaleString(),
        },
        ...prev
      ]);
      console.log('User snapshot saved!');
    } catch (error) {
      console.error('Failed to save user snapshot:', error);
    }
  };

  const deleteSnapshot = async (id: string) => {
    if (!user) {
      // alert("Please sign in to delete snapshots.");
      console.error("Attempted to save snapshot while logged out (safeguard triggered).");
      return;
    }
    // Use user ID in path
    const snapshotDocRef = doc(db, 'users', user.uid, 'snapshots', id);

    try {
      await deleteDoc(snapshotDocRef);
      // Update client state immediately
      setSnapshots((prev) => prev.filter((snap) => snap.id !== id));
       console.log('User snapshot deleted!');
    } catch (error) {
        console.error('Failed to delete user snapshot:', error);
         // TODO: Add user feedback for error
    }
  };


  // Render Logic
  if (authLoading) {
      return <p>Loading authentication...</p>;
  }

  return (
    <>
      {/* Auth UI Section */}
      <div className={styles.authContainer}>
        {user ? (
           // If user is logged in
            <>
            <span className={styles.welcomeMessage}>
              Welcome, {user.displayName || user.email}!
              </span>
            <button onClick={signOutUser} className={`${styles.authButton} ${styles.signOutButton}`}>
              Sign Out</button>
          </>
        ) : (
          // If user is logged out
          <button onClick={signInWithGoogle} className={`${styles.authButton} ${styles.signInButton}`}>
            Sign in with Google
            </button>
        )}
      </div>

      {/* Weather Search (saving now requires login) */}
      <WeatherSearch onSave={addSnapshot} isLoggedIn={!!user} />

      {/* Saved Snapshots Section, uses Conditional Rendering */}
      <h2 className={styles.title}>Saved Weather Snapshots</h2>
      {user ? ( // Only show section if user is logged in
        <div>
          {snapshotsLoading && <p>Loading saved snapshots...</p>}
          {snapshotError && <p style={{ color: 'red' }}>{snapshotError}</p>}
          {!snapshotsLoading && !snapshotError && (
            <SavedSnapshots 
              snapshots={snapshots} 
              onDelete={deleteSnapshot}
              onEdit={editSnapshot}
            />
          )}
        </div>
      ) : ( // Show message if logged out
        <p className={styles.signInPrompt}>
          Please sign in to view and manage saved snapshots.
          </p>
      )}
    </>
  );
}
