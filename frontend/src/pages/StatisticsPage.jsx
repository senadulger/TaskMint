import React, { useState, useEffect, useRef } from 'react';
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
  const chartRef = useRef(null);

  const [chartTextColor, setChartTextColor] = useState('#F0F0FF');

  const [summaryStats, setSummaryStats] = useState({ total: 0, completed: 0, incomplete: 0 });

  useEffect(() => {
    const lightModeColor = '#212529';
    const darkModeColor = '#F0F0FF';

    const currentTheme = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark';

    setChartTextColor(currentTheme === 'light' ? lightModeColor : darkModeColor);
  }, []);

  const processDataForChart = (stats) => {
    let total = 0;
    let completedTotal = 0;
    let incompleteTotal = 0;

    const categories = stats.map(s => s.category);
    const completedData = stats.map(s => {
      const completed = s.statuses.find(status => status.status === 'Completed');
      const count = completed ? completed.count : 0;
      completedTotal += count;
      return count;
    });
    const incompleteData = stats.map(s => {
      const incomplete = s.statuses.find(status => status.status === 'Incomplete');
      const count = incomplete ? incomplete.count : 0;
      incompleteTotal += count;
      return count;
    });

    // Calculate total from all categories
    total = stats.reduce((acc, curr) => acc + curr.totalTasks, 0);

    setSummaryStats({ total, completed: completedTotal, incomplete: incompleteTotal });

    return {
      labels: categories,
      datasets: [
        { label: 'Completed', data: completedData, backgroundColor: '#3DCC91' },
        { label: 'Incomplete', data: incompleteData, backgroundColor: '#FBBF24' },
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
        const { data } = await axios.get('http://localhost:5050/api/tasks/stats', config);
        setChartData(processDataForChart(data));
        setLoading(false);
      } catch (err) {
        setError('Could not load stats.');
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  const handleExportAsPNG = () => {
    if (!chartRef.current) { return; }
    const base64Image = chartRef.current.toBase64Image('image/png');
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = 'task-analysis-chart.png';
    link.click();
  };

  // Grafik seçenekleri 
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartTextColor,
        },
      },
      title: {
        display: true,
        text: 'Task Distribution by Category',
        color: chartTextColor,
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: 'rgba(160, 160, 184, 0.2)',
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: chartTextColor,
        },
        grid: {
          color: 'rgba(160, 160, 184, 0.2)',
        },
      },
    },
  };

  if (loading) return <div>Loading Stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1>Task Analysis</h1>
        <button className={styles.exportButton} onClick={handleExportAsPNG}>
          Export Graph
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #5A80FF' }}>
          <span className={styles.statLabel}>Total Tasks</span>
          <span className={styles.statValue}>{summaryStats.total}</span>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #3DCC91' }}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue}>{summaryStats.completed}</span>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #FBBF24' }}>
          <span className={styles.statLabel}>Incomplete</span>
          <span className={styles.statValue}>{summaryStats.incomplete}</span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {chartData && chartData.labels.length > 0 ? (
          <Bar ref={chartRef} options={options} data={chartData} />
        ) : (
          <p>No statistics found. Add some tasks first.</p>
        )}
      </div>
    </>
  );
};

export default StatisticsPage;