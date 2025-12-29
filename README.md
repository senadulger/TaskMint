# TaskMint – Task Management Web Application

## 1. About the Project

This project was developed as a final assignment for the "Software Development I" course. The main goal is to practice full-stack web development skills including authentication, authorization, database management, and file handling using the MERN stack.

## 2. Features

- **Authentication & Authorization:** Secure login and registration using JWT and Bcrypt.
- **User Roles:**
  - **User:** Can manage their own tasks (Create, Read, Update, Delete).
  - **Admin:** Can view and manage all users and tasks in the system.
- **Task Management:** Create, update, delete, and track tasks with status updates.
- **File Attachments:** Tasks can include image or document attachments.
- **Dashboard:** Visual statistics of task statuses using charts.

## 3. Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | React | Library for building user interfaces |
| | Vite | Fast build tool and development server |
| | CSS Modules | Scoped styling for components |
| **Backend** | Node.js | JavaScript runtime environment |
| | Express.js | Web framework for Node.js |
| **Database** | MongoDB | NoSQL database |
| | Mongoose | ODM library for MongoDB |
| **Security** | JWT | JSON Web Tokens for authentication |
| | Bcrypt | Library for hashing passwords |
| **Tools** | Multer | Middleware for handling file uploads |
| | Axios | HTTP client for API requests |
| | Chart.js | JavaScript library for charts |
| | Jest & Supertest | Testing frameworks |

## 4. Project Structure & Logic

- **MVC Architecture:** The backend follows the Model-View-Controller pattern (separating Models, Controllers, and Routes) to keep code organized.
- **Middleware:** Custom middleware is used to verify JWT tokens and check user roles (User vs Admin) to protect routes.
- **File Uploads:** Multer is configured to handle file storage for task attachments. Files are stored locally on the server.

## 5. How to Run the Project

### Prerequisites
- Node.js installed
- MongoDB installed and running (or a MongoDB Atlas URI)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Irmakyil/task-management-web-app.git
    cd task-management-web-app
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

### Configuration
Create a `.env` file in the `backend` folder with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    npm start
    ```

2.  **Start the Frontend:**
    Open a new terminal configuration:
    ```bash
    cd frontend
    npm run dev
    ```

## 6. Project Demo Video

Check out the project demonstration video to see the main features and overall workflow of the application.

https://github.com/user-attachments/assets/457f2587-e589-40b6-be0d-c37d882f5120

## 7. Project Report

For a deep dive into the technical details, diagrams, and screenshots, please refer to the **Report.pdf** file included in this repository.

## 8. Authors

| Member | LinkedIn |
| :--- | :--- |
| [Irmak Yılmaz](https://github.com/Irmakyil) | <a href="https://www.linkedin.com/in/yilmazirmak/" target="_blank">LinkedIn</a> |
| [Sena Nur Dülger](https://github.com/senadulger) | <a href="https://www.linkedin.com/in/senadulger/" target="_blank">LinkedIn</a> |
