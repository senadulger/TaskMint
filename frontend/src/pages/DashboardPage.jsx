import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  //STATE'ler
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // Search State
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.role === 'admin');
        if (decoded.role === 'admin') {
          fetchUsers(token);
        }
      } catch (e) {
        console.error("Token decode error", e);
      }
      fetchTasks();
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5050/api/auth/users', config);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  // API FONKSİYONLARI (CRUD)
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5050/api/tasks', config);
      setTasks(data);
      setLoading(false);
    } catch (err) { setError('Could not load tasks.'); setLoading(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5050/api/tasks/${taskId}`, config);
        setTasks(tasks.filter((task) => task._id !== taskId));
      } catch (err) { setError('Could not delete task.'); }
    }
  };

  const handleToggleTaskStatus = async (taskToToggle) => {
    const originalTasks = [...tasks];
    const newStatus = taskToToggle.status === 'Completed' ? 'Incomplete' : 'Completed';
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === taskToToggle._id ? { ...task, status: newStatus } : task
      )
    );
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `http://localhost:5050/api/tasks/${taskToToggle._id}`,
        { status: newStatus },
        config
      );
    } catch (err) {
      setError('Could not update task status. Please try again.');
      setTasks(originalTasks);
    }
  };

  const handleOpenModal = () => { setIsModalOpen(true); setTaskToEdit(null); };
  const handleOpenEditModal = (task) => { setIsModalOpen(true); setTaskToEdit(task); };
  const handleCloseModal = () => { setIsModalOpen(false); setTaskToEdit(null); };
  const handleTaskSaved = () => { fetchTasks(); };

  //FİLTRELEME
  const categories = ['All', 'Job', 'Personal', 'Hobby', 'Other'];
  const statuses = ['All', 'Incomplete', 'Completed'];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch = statusFilter === 'All' || task.status === statusFilter;
      const categoryMatch = categoryFilter === 'All' || task.category === categoryFilter;

      let userMatch = true;
      if (isAdmin && userFilter !== 'All') {
        const userId = task.user && typeof task.user === 'object' ? task.user._id : task.user;
        const assignedId = task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;

        userMatch = userId === userFilter || assignedId === userFilter;
      }

      // Search Filter
      const searchMatch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return statusMatch && categoryMatch && userMatch && searchMatch;
    });
  }, [tasks, statusFilter, categoryFilter, userFilter, isAdmin, searchQuery]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {/* Başlık ve "Yeni Görev" butonu */}
      <div className={styles.tasksHeader}>
        <h1>Tasks</h1>
        {error && <p className={styles.pageError}>{error}</p>}

        <div className={styles.headerActions}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.addButton} onClick={handleOpenModal}>
            + Create New Task
          </button>
        </div>
      </div>

      {/* Filtreleme Dropdown'ları */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroupWrapper}>
          <div className={styles.filterWrapper}>
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-status={statusFilter}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterWrapper}>
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              data-category={categoryFilter}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Admin User Filter */}
          {isAdmin && (
            <div className={styles.filterWrapper}>
              <label htmlFor="user-filter">User</label>
              <select
                id="user-filter"
                className={styles.filterSelect}
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                data-category={userFilter === 'All' ? 'All' : 'User'}
              >
                <option value="All">All</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Görev Listesi */}
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
              onToggleStatus={handleToggleTaskStatus}
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