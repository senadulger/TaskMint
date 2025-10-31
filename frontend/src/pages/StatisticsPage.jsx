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
    const categories = stats.map(s => s.category);
    const completedData = stats.map(s => {
      const completed = s.statuses.find(status => status.status === 'Completed');
      return completed ? completed.count : 0;
    });
    const pendingData = stats.map(s => {
      const pending = s.statuses.find(status => status.status === 'Pending');
      return pending ? pending.count : 0;
    });
    return {
      labels: categories,
      datasets: [
        { label: 'Completed', data: completedData, backgroundColor: '#3DCC91' },
        { label: 'Pending', data: pendingData, backgroundColor: '#FF9F40' },
      ],
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5000/api/tasks/stats', config);
        setChartData(processDataForChart(data));
        setLoading(false);
      } catch (err) {
        setError('Could not load stats.');
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);
  
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#F0F0FF' } },
      title: { display: true, text: 'Task Distribution by Category', color: '#F0F0FF', font: { size: 18 } },
    },
    scales: {
      x: { stacked: true, ticks: { color: '#A0A0B8' } },
      y: { stacked: true, ticks: { color: '#A0A0B8' } },
    },
  };

  if (loading) return <div>Loading Stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <h1>Task Analysis</h1>
      <div className={styles.chartContainer}>
        {chartData && chartData.labels.length > 0 ? (
          <Bar options={options} data={chartData} />
        ) : (
          <p>No statistics found. Add some tasks first.</p>
        )}
      </div>
    </>
  );
};

export default StatisticsPage;