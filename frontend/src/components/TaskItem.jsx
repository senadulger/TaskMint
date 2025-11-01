import React from 'react';
import styles from './TaskItem.module.css';
import {
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';

const formatDisplayDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString); 
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};

const TaskItem = ({ task, onDelete, onEdit }) => {
  
  const getCategoryBorderClass = (category) => {
    switch (category.toLowerCase()) {
      case 'job': return styles.borderJob;
      case 'personal': return styles.borderPersonal;
      case 'hobby': return styles.borderHobby;
      case 'other': return styles.borderOther;
      default: return styles.borderOther;
    }
  };
  
  const getCategoryTagClass = (category) => {
    switch (category.toLowerCase()) {
      case 'job': return styles.tagJob;
      case 'personal': return styles.tagPersonal;
      case 'hobby': return styles.tagHobby;
      case 'other': return styles.tagOther;
      default: return styles.tagOther;
    }
  };

  const getDeadlineInfo = () => {
    if (task.status === 'Completed') {
      return { isUrgent: false, isCompleted: true, element: null };
    }
    if (!task.dueDate) {
      return { isUrgent: false, isCompleted: false, element: null };
    }
    
    /* bu kısım tekrar değerlendirilecek */
    const dueDateTimeString = `${task.dueDate.split('T')[0]}T${task.dueTime || '00:00:00'}`;
    const dueDate = new Date(dueDateTimeString);
    const now = new Date();
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return {
        isUrgent: true, isCompleted: false,
        element: (
          <span className={`${styles.dateTime} ${styles.urgentText}`}>
            <FaExclamationTriangle /> Overdue
          </span>
        ),
      };
    }
    if (hoursRemaining <= 24) {
      return {
        isUrgent: true, isCompleted: false,
        element: (
          <span className={`${styles.dateTime} ${styles.urgentText}`}>
            <FaExclamationTriangle /> Last {Math.ceil(hoursRemaining)} hour!
          </span>
        ),
      };
    }
    return {
      isUrgent: false, isCompleted: false,
      element: (
        <>
          <span className={styles.dateTime}>
            <FaCalendarAlt /> {formatDisplayDate(task.dueDate)}
          </span>
          {task.dueTime && (
            <span className={styles.dateTime}>
              <FaClock /> {task.dueTime}
            </span>
          )}
        </>
      ),
    };
  };

  const deadlineInfo = getDeadlineInfo();

  // 4. KART SINIFLARINI AYARLA (Kenarlık Rengi)
  const cardClasses = [styles.taskCard];
  if (deadlineInfo.isCompleted) {
    cardClasses.push(styles.borderCompleted); // YEŞİL
  } else if (deadlineInfo.isUrgent) {
    cardClasses.push(styles.borderUrgent); // KIRMIZI
  } else {
    cardClasses.push(getCategoryBorderClass(task.category)); 
  }

  const handleEdit = (e) => {
    e.stopPropagation(); 
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task._id);
  };
  
  return (
    <div className={cardClasses.join(' ')} onClick={handleEdit}>
      <div className={styles.cardHeader}>
        <h3>{task.title}</h3>
        <div className={styles.actions}>
          <button onClick={handleEdit} className={styles.iconButton}>
            <FaEdit />
          </button>
          <button onClick={handleDelete} className={`${styles.iconButton} ${styles.deleteButton}`}>
            <FaTrash />
          </button>
        </div>
      </div>

      <div className={styles.cardMiddle}>
        {deadlineInfo.element}
      </div>

      <div className={styles.cardFooter}>
        <span className={`${styles.categoryTag} ${getCategoryTagClass(task.category)}`}>
          {task.category}
        </span>
        
        {task.status === 'Completed' ? (
          <FaCheckCircle className={styles.checkCompleted} />
        ) : (
          <FaRegCheckCircle className={styles.checkPending} />
        )}
      </div>
    </div>
  );
};

export default TaskItem;