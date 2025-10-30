import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './StatisticsPage.module.css';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsPage = () => {
  const [chartData, setChartData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const processDataForChart = (stats) => {
    const categories = stats.map(s => s.category); // Eksen (X): ['İş', 'Kişisel', 'Hobi']

    // Verisetleri (Datasets)
    const completedData = stats.map(s => {
      const completed = s.statuses.find(status => status.status === 'Completed');
      return completed ? completed.count : 0; // Bulursa sayısını, bulamazsa 0 dön
    });

    const pendingData = stats.map(s => {
      const pending = s.statuses.find(status => status.status === 'Pending');
      return pending ? pending.count : 0;
    });


    return {
      labels: categories,
      datasets: [
        {
          label: 'Completed',
          data: completedData,
          backgroundColor: '#90be6d', 
        },
        {
          label: 'Pending',
          data: pendingData,
          backgroundColor: '#f8961e', 
        },
      ],
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const { data } = await axios.get('http://localhost:5000/api/tasks/stats', config);

        // 4. Gelen veriyi işle ve state'e ata
        setChartData(processDataForChart(data));
        setLoading(false);
      } catch (err) {
        setError('Statistics are not found or an error occurred while loading.');
        console.error(err);
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Grafik için opsiyonlar 
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#F0F0FF' } // Yazı rengi
      },
      title: {
        display: true,
        text: 'Task Status Distribution by Category',
        color: '#F0F0FF', // Yazı rengi
        font: { size: 18 }
      },
    },
    scales: { // Eksen ayarları
      x: {
        stacked: true, // Çubukları üst üste yığ
        ticks: { color: '#A0A0B8' }
      },
      y: {
        stacked: true,
        ticks: { color: '#A0A0B8' }
      },
    },
  };

  if (loading) return <div className={styles.container}>Loading statistics...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Statistics</h1>
      <div className={styles.chartContainer}>
        {chartData ? (
          <Bar options={options} data={chartData} />
        ) : (
          <p>Statistical data does not found.</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;