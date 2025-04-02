// app/page.tsx (Now a Server Component by default)
import styles from "./home.module.css";
import WeatherAppClient from '@/components/WeatherAppClient'; // New component
import type { SnapshotData } from '@/components/SnapshotCard';
import { collection, getDocs, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from '@/lib/firebase'; // Make sure db initialization works server-side

// Helper function to safely convert Firestore Timestamps or other date types
function serializeDate(date: any): string {
  if (date instanceof Timestamp) {
    return date.toDate().toLocaleString(); // Convert Firestore Timestamp to JS Date, then string
  }
  if (date instanceof Date) {
    return date.toLocaleString(); // Already a JS Date
  }
  // Attempt to handle strings or other types if necessary, or return as is/default
  // Be cautious here based on how you save the date
  return String(date);
}


// Function to fetch initial data on the server
async function getInitialSnapshots(): Promise<SnapshotData[]> {
  try {
    const snapshotCol = collection(db, 'snapshots');
    // Consider adding orderBy and limit if the list grows large
    // const q = query(snapshotCol, orderBy("date", "desc"), limit(20));
    // const snapshotDocs = await getDocs(q);
    const snapshotDocs = await getDocs(snapshotCol);

    const snapshotData = snapshotDocs.docs.map((doc) => {
      const data = doc.data();
      // IMPORTANT: Ensure data fetched on server is serializable
      // Firestore Timestamps need conversion before passing to Client Component
      return {
        id: doc.id,
        city: data.city,
        country: data.country,
        temp: data.temp,
        description: data.description,
        icon: data.icon,
        // Make sure the date is a serializable string
        date: serializeDate(data.date),
      } as SnapshotData;
    });
    return snapshotData;
  } catch (error) {
    console.error("Error fetching initial snapshots:", error);
    return []; // Return empty array on error
  }
}

export default async function Home() {
  // Fetch data directly in the Server Component
  const initialSnapshots = await getInitialSnapshots();

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Weather Now</h1>
      <p className={styles.subtext}>Search for a city to get the current weather!</p>

      {/* Render the Client Component, passing initial data */}
      {/* This component will handle search, save, delete, and state management */}
      <WeatherAppClient initialSnapshots={initialSnapshots} />
    </main>
  );
}