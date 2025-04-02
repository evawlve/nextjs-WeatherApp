// components/WeatherSearch.tsx
'use client';

import { useState } from 'react';
import styles from './WeatherSearch.module.css';

// Define the shape of data expected by the onSave prop
type SnapshotSaveData = {
  city: string;
  country: string;
  temp: number;
  description: string;
  icon: string;
}

// --- TYPE FIX: Change data from tuple '[...]' to array '...[]' ---
interface WeatherObject { // Define the shape of the inner object clearly
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
  data: WeatherObject[]; // <--- Now defined as an ARRAY of WeatherObjects
  count: number;
}
// --- END TYPE FIX ---

interface Props {
  onSave: (snapshotData: SnapshotSaveData) => Promise<void>;
}

export default function WeatherSearch({ onSave }: Props) {
  const [location, setLocation] = useState('');
  // Initialize weatherData state with null or an object matching the structure but empty
  const [weatherData, setWeatherData] = useState<WeatherbitResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state

  async function fetchWeather() {
    if (!location) return;

    setIsLoading(true);
    setError(null); // Clear previous errors
    setWeatherData(null); // Clear previous data

    const apiKey = process.env.NEXT_PUBLIC_WEATHERBIT_API_KEY || 'YOUR_FALLBACK_KEY'; // Use env var
    const url = `https://api.weatherbit.io/v2.0/current?city=${encodeURIComponent(location)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg; // Use API error message if available
        } catch (_) {
            // Ignore if error response is not JSON
        }
        throw new Error(errorMsg);
      }
      const data: WeatherbitResponse = await response.json();

      // --- CHECK FIX: Use the corrected type ---
      // Check if data exists, data.data is an array, and it's not empty
      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        console.warn("No weather data found for city:", location);
        throw new Error(`No weather data found for ${location}. Please check the city name.`);
      }
      // --- END CHECK FIX ---

      setWeatherData(data); // Set the valid data

    } catch (err) {
      console.error('Error fetching weather data:', err);
      // Set error state here to display message to user
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setWeatherData(null); // Ensure data is cleared on error
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
     // --- CHECK FIX: Use the corrected type ---
     // Ensure weatherData and its data array with at least one element exist
     if (!weatherData || !Array.isArray(weatherData.data) || weatherData.data.length === 0) {
        console.error("Cannot save snapshot: Weather data is missing or invalid.");
        setError("Cannot save snapshot: Weather data is missing."); // Show error
        return;
     }
     // --- END CHECK FIX ---

     // Access the first element safely now
     const currentWeatherData = weatherData.data[0];

     setIsSaving(true);
     setError(null); // Clear error on save attempt

    const snapshot: SnapshotSaveData = {
      city: currentWeatherData.city_name,
      country: currentWeatherData.country_code,
      temp: currentWeatherData.temp,
      description: currentWeatherData.weather.description,
      icon: currentWeatherData.weather.icon,
    };

    try {
      await onSave(snapshot);
      // Optionally: Add success feedback to the user
      // setWeatherData(null); // Maybe clear search results after saving?
    } catch (err) {
      console.error('Failed to trigger save:', err);
      setError(err instanceof Error ? `Failed to save: ${err.message}` : 'Failed to save snapshot.');
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
            aria-describedby={error ? "error-message" : undefined} // Accessibility
          />
        </div>
         <button type="submit" className={styles.button} disabled={isLoading}>
           {isLoading ? 'Fetching...' : 'Get Weather'}
         </button>
      </form>

       {/* Display loading state */}
       {isLoading && <p role="status">Fetching weather...</p>}

        {/* Display error message */}
       {error && <p id="error-message" role="alert" className={styles.error}>{error}</p>}

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
            disabled={isSaving || isLoading} // Also disable if loading weather
          >
            {isSaving ? 'Saving...' : 'Save Snapshot'}
          </button>
        </>
      )}
    </div>
  );
}