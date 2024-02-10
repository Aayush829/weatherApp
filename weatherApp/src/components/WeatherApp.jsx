import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('metric');
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(recent);
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=09343c8c8c763719e1f0881210117096`);
      setWeatherData(response.data);
      
      const updatedRecentSearches = [city, ...recentSearches.slice(0, 4)]; 
      setRecentSearches(updatedRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));

      renderChart(response.data);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const renderChart = (data) => {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Temperature', 'Humidity', 'Wind Speed'],
        datasets: [{
          label: 'Weather Data',
          data: [data.main.temp, data.main.humidity, data.wind.speed],
          backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2);
                }
                return label;
              }
            }
          }
        }
      }
    });
  };

  return (
    <div>
      <h1>Weather App</h1>
      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
      <button onClick={handleSearch}>Search</button>

      {error && <p>{error}</p>}

      {weatherData && (
        <div>
          <h2>{weatherData.name}</h2>
          <p>Temperature: {weatherData.main.temp} {unit === 'metric' ? '°C' : '°F'}</p>
          <p>Weather: {weatherData.weather[0].main}</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
          <canvas id="weatherChart" width="400" height="400"></canvas>
        </div>
      )}

      <div>
        <button onClick={() => setUnit('metric')}>Celsius</button>
        <button onClick={() => setUnit('imperial')}>Fahrenheit</button>
      </div>

      <h2>Recent Searches</h2>
      <ul>
        {recentSearches.map((search, index) => (
          <li key={index}>{search}</li>
        ))}
      </ul>
    </div>
  );
};

export default WeatherApp;
