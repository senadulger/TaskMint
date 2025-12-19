import React from 'react';
import styles from './TaskItem.module.css';
import { jwtDecode } from 'jwt-decode';
import {
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaClock,
  FaPaperclip
} from 'react-icons/fa';

// Tarihi "Today", "Tomorrow" veya "November 5" formatına getiren fonksiyon
const formatDisplayDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error("Invalid date value received:", dateString);
    return "Invalid Date";
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};


const TaskItem = ({ task, onDelete, onEdit, onToggleStatus }) => {

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
    let isUrgent = false;
    let isCompleted = task.status === 'Completed';
    let urgentMessage = null;

    if (isCompleted || !task.dueDate) {
      return { isUrgent, isCompleted, urgentMessage };
    }

    // Son teslim tarihini ve saatini birleştirerek Date objesi oluştur
    const dueDateTimeString = `${task.dueDate.split('T')[0]}T${task.dueTime || '00:00:00'}`;
    const dueDate = new Date(dueDateTimeString);
    const now = new Date(); // Şu anki zaman

    // Kalan saat hesaplaması
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Vade geçmiş veya son 24 saat içinde mi kontrol et
    if (hoursRemaining < 0) {
      isUrgent = true;
      urgentMessage = "Overdue";
    } else if (hoursRemaining <= 24) {
      isUrgent = true;
      urgentMessage = `Last ${Math.ceil(hoursRemaining)} hour!`;
    }

    return { isUrgent, isCompleted, urgentMessage };
  };

  const { isUrgent, isCompleted, urgentMessage } = getDeadlineInfo();

  let currentUserId = null;
  let isAdmin = false;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      currentUserId = decoded.id;
      isAdmin = decoded.role === 'admin';
    }
  } catch (e) { }

  const assignedToName = task.assignedTo ? (typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Unknown') : null;
  const isAssignedToOther = task.assignedTo && (typeof task.assignedTo === 'object' ? task.assignedTo._id !== currentUserId : task.assignedTo !== currentUserId);

  // Dosya var mı kontrolü
  const hasFiles = task.attachments && task.attachments.length > 0;
  // İlk dosyanın linki (Hızlı erişim için)
  const firstFileUrl = hasFiles ? `http://localhost:5050${task.attachments[0].storagePath}` : '#';

  const cardClasses = [
    styles.taskCard,
    isCompleted ? styles.borderCompleted : (isUrgent ? styles.borderUrgent : getCategoryBorderClass(task.category))
  ];

  // Olay işleyiciler (stopPropagation ile olayların üst elementlere yayılmasını engeller)
  const handleEdit = (e) => { e.stopPropagation(); onEdit(task); };
  const handleDelete = (e) => { e.stopPropagation(); onDelete(task._id); };
  const handleToggle = (e) => { e.stopPropagation(); onToggleStatus(task); };


  return (
    <div className={cardClasses.join(' ')} onClick={handleEdit}>

      {/* Kartın Başlık ve Aksiyon İkonları Bölümü */}
      <div className={styles.cardHeader}>
        <h3>{task.title}</h3> {/* Görev Başlığı */}
        <div className={styles.actions}>
          {/* Düzenleme Butonu */}
          <button onClick={handleEdit} className={styles.iconButton}>
            <FaEdit />
          </button>
          {/* Silme Butonu */}
          <button onClick={handleDelete} className={`${styles.iconButton} ${styles.deleteButton}`}>
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Açıklama ve Tarih/Saat Bilgisi */}
      <div className={styles.cardMiddle}>
        {/* Görev Açıklaması */}
        {task.description && <p className={styles.description}>{task.description}</p>}

        {/* Tarih ve Saat Gösterimi */}
        {task.dueDate ? (
          <div className={styles.dateTimeWrapper}>
            <span className={styles.dateTime}>
              <FaCalendarAlt /> {formatDisplayDate(task.dueDate)} {/* Formatlanmış Tarih */}
            </span>
            {task.dueTime && (
              <span className={styles.dateTime}>
                <FaClock /> {task.dueTime} {/* Saat Bilgisi */}
              </span>
            )}
          </div>
        ) : (
          <span className={styles.dateTime}>&nbsp;</span>
        )}


        {/* Assigned to OTHER */}
        {(isAdmin || isAssignedToOther) && assignedToName && (
          <div className={styles.assignedTo}>
            <small>Assigned to: <strong>{assignedToName}</strong></small>
          </div>
        )}

        {/* Assigned to ME */}
        {!isAssignedToOther && task.assignedTo && (
          <div className={styles.assignedTo}>
            <small>Assigned by: <strong>{task.user?.name || 'Unknown'}</strong></small>
          </div>
        )}
      </div>

      {/* Kartın Alt Kısım: Kategori Etiketi, Uyarı ve Tamamlama Checkbox'ı */}
      <div className={styles.cardFooter}>
        <div className={styles.footerLeft}>
          {/* Kategori Etiketi */}
          <span className={`${styles.categoryTag} ${getCategoryTagClass(task.category)}`}>
            {task.category}
          </span>

          {/* Dosya İkonu ve Sayısı*/}
          {hasFiles && (
            <div
              className={styles.attachmentBadge}
              onClick={(e) => {
                e.stopPropagation();
                const token = localStorage.getItem('token');
                const file = task.attachments[0];
                const url = `http://localhost:5050/api/tasks/attachments/${file.attachmentId}`;

                fetch(url, {
                  headers: { 'Authorization': `Bearer ${token}` }
                })
                  .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.blob();
                  })
                  .then(blob => {
                    const fileUrl = window.URL.createObjectURL(blob);
                    window.open(fileUrl, '_blank');
                  })
                  .catch(err => console.error("Download error:", err));
              }}
              title={`${task.attachments.length} file(s) attached`}
              style={{ cursor: 'pointer' }}
            >
              <FaPaperclip />
              <span>{task.attachments.length}</span>
            </div>
          )}

          {/*Aciliyet Uyarısı (eğer acilse ve mesaj varsa) */}
          {isUrgent && (
            <span className={styles.urgentText}>
              <FaExclamationTriangle /> {urgentMessage} {/* Uyarı Metni */}
            </span>
          )}

        </div>

        {/* Görev Tamamlama Butonu (Checkbox) */}
        <button className={styles.checkButton} onClick={handleToggle}>
          {isCompleted ? (
            <FaCheckCircle className={styles.checkCompleted} /> // Tamamlandıysa dolu ikon
          ) : (
            <FaRegCheckCircle className={styles.checkPending} /> // Bekliyorsa boş ikon
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;