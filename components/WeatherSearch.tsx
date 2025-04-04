'use client'; //CSR

import { useState } from 'react';
import styles from './WeatherSearch.module.css';

// Define shape of data expected by the onSave prop
type SnapshotSaveData = {
  city: string;
  country: string;
  temp: number;
  description: string;
  icon: string;
}

interface WeatherObject { // Define the shape of the inner object 
    city_name: string;
    country_code: string;
    temp: number;
    weather: {
      description: string;
      icon: string;
    };
    wind_spd: number;
    rh: number;
}

interface WeatherbitResponse {
  data: WeatherObject[]; // Array of WeatherObjects
  count: number;
}

interface Props {
  onSave: (snapshotData: SnapshotSaveData) => Promise<void>;
  isLoggedIn: boolean;
}

export default function WeatherSearch({ onSave, isLoggedIn }: Props) {
  const [location, setLocation] = useState('');
  // Initialize weatherData state with null or an object matching the structure but empty
  const [weatherData, setWeatherData] = useState<WeatherbitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // save snapshot state
  const [fetchError, setError] = useState<string | null>(null); // fetch errors
  const [saveError, setSaveError] = useState<string | null>(null);

  async function fetchWeather() {
    if (!location) return;

    setIsLoading(true);
    setError(null); // Clear fetch errors
    setSaveError(null); // <-- Clear SAVE errors too on new fetch
    setWeatherData(null);

    const apiKey = process.env.NEXT_PUBLIC_WEATHERBIT_API_KEY || 'FALLBACK_KEY';
    const url = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(location)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) { /* Ignore */ }
        throw new Error(errorMsg);
      }
      const data: WeatherbitResponse = await response.json();
      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error(`No weather data found for ${location}. Please check the city name.`);
      }
      setWeatherData(data);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred'); // Set FETCH error
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    // Clear previous save error at the start
    setSaveError(null);

    if (!isLoggedIn) {
       setSaveError("Please sign in to save snapshots."); // Set the NEW saveError state
       return; // Stop execution
    }

    // Check weather data validity
    if (!weatherData || !Array.isArray(weatherData.data) || weatherData.data.length === 0) {
       console.error("Cannot save snapshot: Weather data is missing or invalid.");
       setSaveError("Cannot save snapshot: Weather data is missing.");
       return;
    }

    // Proceed if logged in and data is valid
    const currentWeatherData = weatherData.data[0];
    setIsSaving(true);

    const snapshot: SnapshotSaveData = { /* ... create snapshot ... */
       city: currentWeatherData.city_name,
       country: currentWeatherData.country_code,
       temp: currentWeatherData.temp,
       description: currentWeatherData.weather.description,
       icon: currentWeatherData.weather.icon,
    };

   try {
     await onSave(snapshot);
   } catch (err) {
     // catch errors thrown by the onSave promise  
     console.error('Failed during onSave call:', err);
     // Use setSaveError to display save-related failures near button
     setSaveError(err instanceof Error ? `Failed to save: ${err.message}` : 'Failed to save snapshot.');
   } finally {
      setIsSaving(false);
   }
 }

  return (
    <div className={styles.container}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWeather();
        }}
        className={styles.form}
      >
         <div className={styles.inputRow}>
          <label htmlFor="city-input" className={styles.label}>
            City Name:
          </label>
          <input
            id="city-input"
            className={styles.input}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter city"
            aria-describedby={fetchError ? "error-message" : undefined} // Accessibility
          />
        </div>
         <button type="submit" className={styles.button} disabled={isLoading}>
           {isLoading ? 'Fetching...' : 'Get Weather'}
         </button>
      </form>

       {/* Display loading state */}
       {isLoading && <p role="status">Fetching weather...</p>}

        {/* Display error message */}
        {fetchError && <p id="error-message" role="alert" className={styles.error}>{fetchError}</p>}

       {/* Display results (ensure weatherData and data[0] exist) */}
       {weatherData && weatherData.data.length > 0 && (
        <>
          <div
            key={weatherData.data[0].city_name}
            className={styles.results}
          >
            <h2>
              {weatherData.data[0].city_name}, {weatherData.data[0].country_code}
            </h2>
            <img
              className={styles.icon}
              src={`https://www.weatherbit.io/static/img/icons/${weatherData.data[0].weather.icon}.png`}
              alt={weatherData.data[0].weather.description}
              width={64}
              height={64}
            />
            <p>{weatherData.data[0].weather.description}</p>
            <p>🌡 Temp: {weatherData.data[0].temp}°C</p>
            <p>💧 Humidity: {weatherData.data[0].rh}%</p>
            <p>🌬 Wind: {weatherData.data[0].wind_spd} m/s</p>
          </div>

          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving || isLoading} //disable if loading weather or if saving
          >
            {isSaving ? 'Saving...' : 'Save Snapshot'}
          </button> 
          {saveError && <p className={styles.saveError}>{saveError}</p>}
        </>
      )}
    </div>
  );
}