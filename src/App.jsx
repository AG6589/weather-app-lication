import { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, RefreshCw, Sun, Cloud, Wind, Droplets, Thermometer, Eye, Gauge, Sunrise as SunriseIcon, Sunset as SunsetIcon } from "lucide-react";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [city, setCity] = useState("");

  const API_KEY = import.meta.env.VITE_API_KEY;
  const BASE_URL = "https://api.openweathermap.org/data/2.5";

  const fetchWeather = async (searchCity) => {
    if (!searchCity) return;
    setLoading(true);
    setError("");
    try {
      // Fetch current weather
      const currentRes = await axios.get(`${BASE_URL}/weather?q=${searchCity}&units=metric&appid=${API_KEY}`);
      setWeather(currentRes.data);

      // Fetch 5-day forecast
      const forecastRes = await axios.get(`${BASE_URL}/forecast?q=${searchCity}&units=metric&appid=${API_KEY}`);
      // Filter werecast to get one reading per day (at 12:00)
      const dailyForecast = forecastRes.data.list.filter(item => item.dt_txt.includes("12:00:00"));
      setForecast(dailyForecast);

    } catch (err) {
      setError(err.response?.status === 404 ? "City not found. Please try again." : "An error occurred.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather(city);
  };

  // Initial fetch for a default city
  useEffect(() => {
    fetchWeather("Chennai");
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app-container min-h-screen text-slate-100 p-4 md:p-8">
      {/* Background Overlay */}
      <div className="bg-overlay"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-2">
            <Sun className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">Weather <span className="text-blue-400">App</span></h1>
          </div>
          <button className="bg-slate-800/80 p-2 rounded-full border border-slate-700 hover:bg-slate-700 transition-all">
            <Thermometer className="w-5 h-5 text-blue-300" />
          </button>
        </header>

        {/* Search Bar */}
        <div className="relative mb-8 group">
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-full py-4 pl-12 pr-12 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-500"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors">
              <MapPin className="w-5 h-5" />
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center my-20">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-400" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-center mb-8">
            {error}
          </div>
        )}

        {weather && !loading && (
          <main className="animate-in fade-in duration-700">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => fetchWeather(weather.name)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {/* Main Weather Card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center">
                <h2 className="text-4xl font-bold mb-1 tracking-tight text-center">{weather.name}, {weather.sys.country}</h2>
                <p className="text-slate-400 capitalize mb-6 text-lg">{weather.weather[0].description}</p>

                <div className="flex flex-col items-center mb-8">
                  <img
                    src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].description}
                    className="w-32 h-32 -my-4 animate-bounce-slow"
                  />
                  <div className="text-7xl font-bold text-white flex items-start">
                    {Math.round(weather.main.temp)}
                    <span className="text-3xl text-blue-400 mt-2">°C</span>
                  </div>
                </div>

                <div className="flex gap-4 text-slate-300 font-medium">
                  <span className="flex items-center gap-1"><span className="text-blue-400">↑</span> {Math.round(weather.main.temp_max)}°</span>
                  <span className="flex items-center gap-1"><span className="text-orange-400">↓</span> {Math.round(weather.main.temp_min)}°</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 gap-4">
                <DetailCard icon={<Droplets className="text-blue-400" />} label="Humidity" value={`${weather.main.humidity}%`} />
                <DetailCard icon={<Wind className="text-pink-400" />} label="Wind" value={`${weather.wind.speed} m/s`} />
                <DetailCard icon={<Thermometer className="text-orange-400" />} label="Feels Like" value={`${Math.round(weather.main.feels_like)}°C`} />
                <DetailCard icon={<Cloud className="text-blue-300" />} label="Clouds" value={`${weather.clouds.all}%`} />
                <DetailCard icon={<Eye className="text-purple-400" />} label="Visibility" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
                <DetailCard icon={<Gauge className="text-emerald-400" />} label="Pressure" value={`${weather.main.pressure} hPa`} />
                <DetailCard icon={<SunriseIcon className="text-yellow-400" />} label="Sunrise" value={formatTime(weather.sys.sunrise)} />
                <DetailCard icon={<SunsetIcon className="text-orange-300" />} label="Sunset" value={formatTime(weather.sys.sunset)} />
              </div>
            </div>

            {/* Forecast Section */}
            <section className="mt-12 mb-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 px-2">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                5-Day Forecast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {forecast.map((day, ix) => (
                  <div key={ix} className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center hover:bg-slate-800/50 transition-all group shadow-lg">
                    <p className="text-slate-400 text-sm font-medium mb-2">
                      {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <img
                      src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                      className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform"
                    />
                    <p className="text-xl font-bold text-white">{Math.round(day.main.temp)}°C</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{day.weather[0].main}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 hover:border-slate-600 transition-colors shadow-lg">
      <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default App;