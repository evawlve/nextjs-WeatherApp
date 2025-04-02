// Server Component by default
import styles from "./home.module.css";
import WeatherAppClient from '@/components/WeatherAppClient'; // Client Component Driver

export default async function Home() {

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Weather Now</h1>
      <p className={styles.subtext}>Search for a city to get the current weather!</p>

      {/* Render the Client Component */}
      {/* WeatherAppClient handles search, save, delete, and state management */}
      <WeatherAppClient />
    </main>
  );
}