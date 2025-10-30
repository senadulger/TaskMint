import React from 'react';
import styles from './TaskItem.module.css';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const TaskItem = ({ task, onDelete, onEdit }) => {
  
  const getCategoryClass = (category) => {
    switch (category.toLowerCase()) {
      case 'job':
        return styles.catJob;
      case 'personal':
        return styles.catPersonal;
      case 'hobby':
        return styles.catHobby;
      case 'other':
        return styles.catOther;
      default:
        return styles.catOther;
    }
  };

  const getStatusOrDeadline = () => {
    if (task.status === 'Completed') {
      return (
        <span className={`${styles.status} ${styles.statusCompleted}`}>
          <FaCheckCircle /> Completed
        </span>
      );
    }
    
    if (task.dueDate) {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursRemaining < 0) {
        return (
          <span className={`${styles.status} ${styles.statusUrgent}`}>
            <FaExclamationTriangle /> Overdue
          </span>
        );
      }
      if (hoursRemaining <= 24) {
        return (
          <span className={`${styles.status} ${styles.statusUrgent}`}>
            <FaExclamationTriangle /> Due Soon
          </span>
        );
      }
    }
    
    return null;
  };

  return (
    <div className={styles.taskCard} onClick={() => onEdit(task)}>
      <div className={styles.cardHeader}>
        <h3>{task.title}</h3>
      </div>
      
      <div className={styles.cardFooter}>
        <span className={`${styles.categoryTag} ${getCategoryClass(task.category)}`}>
          {task.category}
        </span>
        {getStatusOrDeadline()}
      </div>
    </div>
  );
};

export default TaskItem;