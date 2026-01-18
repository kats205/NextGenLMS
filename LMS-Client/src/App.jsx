import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import axiosClient from './api/axiosClient';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import './App.css'



function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Backend Connection...');
        const data = await axiosClient.get('/v1/api/healthy');
        console.log('✅ Backend Response:', data);
        alert(`Kết nối thành công! Database: ${data.databaseConnection}`);
      } catch (error) {
        console.error('❌ Connection Failed:', error);
        alert('Kết nối thắt bại! Xem Console để biết chi tiết.');
      }
    };
    testConnection();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
