import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [categoryFilter, setCategoryFilter] = useState('All'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/tasks', config);
      setTasks(data);
      setLoading(false);
    } catch (err) {
      setError('Could not load tasks.');
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, config);
        setTasks(tasks.filter((task) => task._id !== taskId));
      } catch (err) {
        setError('Could not delete task.');
        console.error(err);
      }
    }
  };

  const handleOpenModal = () => { setIsModalOpen(true); setTaskToEdit(null); };
  const handleOpenEditModal = (task) => { setIsModalOpen(true); setTaskToEdit(task); };
  const handleCloseModal = () => { setIsModalOpen(false); setTaskToEdit(null); };
  const handleTaskSaved = () => { fetchTasks(); }; // Listeyi yenile

  const categories = ['All', 'Job', 'Personal', 'Hobby', 'Other'];
  const statuses = ['All', 'Pending', 'Completed'];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === 'All' || task.status === statusFilter;
      const categoryMatch = categoryFilter === 'All' || task.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [tasks, statusFilter, categoryFilter]);

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <> 
      <div className={styles.header}>
        <h1>Tasks</h1>
        <button className={styles.addButton} onClick={handleOpenModal}>
          + Add New Task
        </button>
      </div>

      {/* Filtre Alanı */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          {statuses.map((status) => (
            <button
              key={status}
              className={`${styles.filterButton} ${statusFilter === status ? styles.activeFilter : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${categoryFilter === category ? styles.activeFilter : ''}`}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.taskList}>
        {filteredTasks.length === 0 ? (
          <p>No tasks found for these filters.</p>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onDelete={handleDeleteTask} 
              onEdit={handleOpenEditModal} 
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          onClose={handleCloseModal}
          taskToEdit={taskToEdit}
          onTaskSaved={handleTaskSaved}
        />
      )}
    </>
  );
};

export default DashboardPage;