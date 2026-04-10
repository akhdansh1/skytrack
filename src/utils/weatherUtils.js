export const getWeatherDescription = (code) => {
  if (code === 0) return 'Cerah';
  if (code <= 3) return 'Berawan Sebagian';
  if (code <= 48) return 'Berkabut';
  if (code <= 57) return 'Gerimis';
  if (code <= 67) return 'Hujan';
  if (code <= 77) return 'Hujan Salju';
  if (code <= 82) return 'Hujan Lebat';
  if (code <= 86) return 'Badai Salju';
  if (code <= 99) return 'Badai Petir';
  return 'Tidak Diketahui';
};

export const getWeatherEmoji = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '⛈️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
};

export const getBackgroundColors = (code) => {
  if (code === 0) return ['#1a1a2e', '#e94560', '#f5a623'];
  if (code <= 3)  return ['#0f0c29', '#302b63', '#24243e'];
  if (code <= 48) return ['#2c3e50', '#3d5a6d', '#4a6fa5'];
  if (code <= 67) return ['#1a2a4a', '#2d4a6e', '#1a3a5c'];
  if (code <= 99) return ['#0d0d1a', '#1a1a2e', '#2d2d3e'];
  return ['#0f0c29', '#302b63', '#24243e'];
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5)  return 'Selamat Dini Hari';
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

export const formatTemp = (temp) => `${Math.round(temp)}°C`;
