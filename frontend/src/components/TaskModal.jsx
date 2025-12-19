import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import styles from './TaskModal.module.css';

// O anki tarihi YYYY-MM-DD formatında alır 
const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// O anki saati HH:MM formatında alır 
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const TaskModal = ({ onClose, taskToEdit, onTaskSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Job');

  const [dueDate, setDueDate] = useState(getTodayDate());
  const [dueTime, setDueTime] = useState(getCurrentTime());
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [files, setFiles] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.role === 'admin');
        if (decoded.role === 'admin') {
          fetchUsers(token);
        }
      } catch (e) {
        console.error("Token decode error", e);
      }
    }

    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      if (taskToEdit.dueDate) {
        setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
      }
      if (taskToEdit.dueTime) {
        setDueTime(taskToEdit.dueTime);
      }
      if (taskToEdit.assignedTo) {
        // assignedTo, nesne (populate edilmiş) veya ID olabilir
        setAssignedTo(typeof taskToEdit.assignedTo === 'object' ? taskToEdit.assignedTo._id : taskToEdit.assignedTo);
      }
    }
  }, [taskToEdit]);

  const fetchUsers = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5050/api/auth/users', config);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleFileChange = (e) => {
    // Yeni seçilen dosyaları mevcut dosyaların üzerine ekle (append)
    const newFiles = Array.from(e.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  // Yeni eklenen (henüz yüklenmemiş) dosyayı listeden çıkarma
  const handleRemovePendingFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Dosya Silme Fonksiyonu
  const handleDeleteFile = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5050/api/tasks/${taskToEdit._id}/attachments/${attachmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Başarılı olursa listeyi güncellemek için ana sayfayı tetikle veya modalı kapat/aç
      alert('File deleted successfully');
      onTaskSaved(); // Listeyi yenile
      onClose(); // Modalı kapat
    } catch (err) {
      console.error(err);
      alert('Failed to delete file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Geçmiş tarih/saat kontrolü
    if (dueDate && dueTime) {
      const selectedDateTime = new Date(`${dueDate}T${dueTime}`);
      const now = new Date();

      if (selectedDateTime < new Date(now.getTime() - 60000)) {
        setError('You cannot set a deadline in the past.');
        return;
      }
    }

    const token = localStorage.getItem('token');

    // --- FormData Kullanımı ---
    // Dosya göndermek için JSON yerine FormData kullanmalıyız.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('dueDate', dueDate);
    formData.append('dueTime', dueTime);
    formData.append('status', taskToEdit ? taskToEdit.status : 'Incomplete');
    if (assignedTo !== undefined && assignedTo !== null) {
      formData.append('assignedTo', assignedTo);
    }

    // Dosyaları ekle (Backend 'attachments' anahtarını bekliyor)
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('attachments', files[i]);
      }
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      if (taskToEdit) {
        // PUT isteği (FormData ile)
        await axios.put(
          `http://localhost:5050/api/tasks/${taskToEdit._id}`,
          formData,
          config
        );
      } else {
        // POST isteği (FormData ile)
        await axios.post('http://localhost:5050/api/tasks', formData, config);
      }
      onTaskSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the task.');
      console.error(err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {/* Görev Adı (Title) */}
          <div className={styles.formGroup}>
            <label htmlFor="title">Task Name</label>
            <input
              type="text"
              id="title"
              placeholder="Exp: Prepare the project report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Açıklama (Description) */}
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="A detailed description of your mission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* --- Dosya Yükleme Alanı --- */}
          <div className={styles.formGroup}>
            <label htmlFor="attachments">Attachments (Max 10MB - PDF, Img, Doc)</label>

            {/* Native file input gizli (Tarayıcının Türkçe metnini göstermemek için) */}
            <input
              type="file"
              id="attachments"
              multiple // Birden fazla dosya seçimine izin ver
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" // İzin verilen uzantılar
            />

            {/* Custom İngilizce dosya seçme alanı */}
            <div className={styles.filePickerRow}>
              <label htmlFor="attachments" className={styles.fileButton}>
                Choose files
              </label>

              <span className={styles.fileHint}>
                {files.length === 0 ? 'No file chosen' : `${files.length} file(s) added`}
              </span>
            </div>

            {/* Yeni Eklenen Dosyaların Listesi */}
            {files.length > 0 && (
              <ul className={styles.attachmentList} style={{ marginTop: '0.5rem' }}>
                {files.map((file, index) => (
                  <li key={index} className={styles.attachmentItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileMeta}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingFile(index)}
                      className={styles.deleteFileButton}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* --- Mevcut Dosyaları Listeleme ve Silme --- */}
          {taskToEdit && taskToEdit.attachments && taskToEdit.attachments.length > 0 && (
            <div className={styles.formGroup}>
              <label>Attached Files:</label>
              <ul className={styles.attachmentList}>
                {taskToEdit.attachments.map((file, index) => (
                  <li key={index} className={styles.attachmentItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName} title={file.originalFileName}>
                        {file.originalFileName}
                      </span>
                      <span className={styles.fileMeta}>
                        {(file.fileSize / 1024).toFixed(1)} KB • {new Date(file.uploadDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className={styles.fileActions}>
                      <div className={styles.actionButtonsRow}>
                        {/* İndirme/Önizleme Linki */}
                        <span
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              const response = await axios.get(
                                `http://localhost:5050/api/tasks/attachments/${file.attachmentId}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                  responseType: 'blob'
                                }
                              );
                              // Blob'dan URL oluştur ve yeni sekmede aç
                              const fileUrl = window.URL.createObjectURL(new Blob([response.data], { type: file.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg' }));
                              window.open(fileUrl, '_blank');
                            } catch (err) {
                              console.error("File download failed", err);
                              alert("Could not load file");
                            }
                          }}
                          className={styles.viewLink}
                          title="View"
                        >
                          View
                        </span>

                        {/* Download Link */}
                        <span
                          onClick={async () => {
                            try {
                              const response = await axios.get(
                                `http://localhost:5050/api/tasks/attachments/${file.attachmentId}`,
                                { responseType: 'blob' }
                              );
                              const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement('a');
                              link.href = fileUrl;
                              link.setAttribute('download', file.originalFileName || 'download.file');
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            } catch (err) {
                              console.error("File download failed", err);
                              alert("Could not download file");
                            }
                          }}
                          className={styles.downloadLink}
                        >
                          Download
                        </span>
                      </div>

                      {/* --- Silme Butonu --- */}
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file._id)}
                        className={styles.deleteFileButton}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tarih/Saat ve Kategori için yatay (row) yerleşim */}
          <div className={styles.row}>
            <div className={styles.formGroup} style={{ flex: 2 }}>
              <label htmlFor="dueDate">Deadline</label>
              <div className={styles.dateTimeContainer}>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.dateInput}
                  min={getTodayDate()}
                />
                <input
                  type="time"
                  id="dueTime"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>
            </div>

            {/* Kategori (Category) */}
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-category={category}
              >
                <option value="Job">Job</option>
                <option value="Personal">Personal</option>
                <option value="Hobby">Hobby</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Admin Assignment */}
          {isAdmin && (
            <div className={styles.formGroup}>
              <label htmlFor="assignedTo">Assign To (Admin Only)</label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}


          {/* Form Eylemleri (Butonlar) */}
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {taskToEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default TaskModal;
