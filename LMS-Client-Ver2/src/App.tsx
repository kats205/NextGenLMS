import { useState } from 'react';
import { LoginPage } from './components/auth/LoginPage';
import { ChangePasswordPage } from './components/auth/ChangePasswordPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';
import { CourseDetailPage } from './components/lecturer/CourseDetailPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { CoursePlayerPage } from './components/student/CoursePlayerPage';
import { ProgressPage } from './components/student/ProgressPage';
import { AssessmentListPage } from './components/student/AssessmentListPage';
import { AssessmentAttemptPage } from './components/student/AssessmentAttemptPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagementPage } from './components/admin/UserManagementPage';
import { SystemConfigPage } from './components/admin/SystemConfigPage';

export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  address?: string;
  description?: string;
  avatar?: string;
  mustChangePassword: boolean;
}

type Page = 
  | 'login' 
  | 'change-password' 
  | 'forgot-password' 
  | 'profile'
  | 'lecturer-dashboard'
  | 'course-detail'
  | 'student-dashboard'
  | 'course-player'
  | 'progress'
  | 'assessment-list'
  | 'assessment-attempt'
  | 'admin-dashboard'
  | 'user-management'
  | 'system-config';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.mustChangePassword) {
      setCurrentPage('change-password');
    } else {
      // Redirect based on role
      if (user.role === 'lecturer') {
        setCurrentPage('lecturer-dashboard');
      } else if (user.role === 'student') {
        setCurrentPage('student-dashboard');
      } else if (user.role === 'admin') {
        setCurrentPage('admin-dashboard');
      }
    }
  };

  const handlePasswordChanged = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, mustChangePassword: false };
      setCurrentUser(updatedUser);
      // Redirect based on role
      if (updatedUser.role === 'lecturer') {
        setCurrentPage('lecturer-dashboard');
      } else if (updatedUser.role === 'student') {
        setCurrentPage('student-dashboard');
      } else if (updatedUser.role === 'admin') {
        setCurrentPage('admin-dashboard');
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setSelectedCourseId(null);
    setSelectedLessonId(null);
    setSelectedAssessmentId(null);
  };

  const handleNavigate = (page: Page, courseId?: string, lessonId?: string, assessmentId?: string) => {
    setCurrentPage(page);
    if (courseId !== undefined) setSelectedCourseId(courseId);
    if (lessonId !== undefined) setSelectedLessonId(lessonId);
    if (assessmentId !== undefined) setSelectedAssessmentId(assessmentId);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // Render appropriate page based on currentPage and user role
  if (!currentUser || currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  if (currentPage === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={handleNavigate} />;
  }

  if (currentUser.mustChangePassword || currentPage === 'change-password') {
    return <ChangePasswordPage user={currentUser} onPasswordChanged={handlePasswordChanged} />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage user={currentUser} onNavigate={handleNavigate} onProfileUpdate={handleProfileUpdate} />;
  }

  // Lecturer pages
  if (currentUser.role === 'lecturer') {
    if (currentPage === 'lecturer-dashboard') {
      return <LecturerDashboard user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'course-detail' && selectedCourseId) {
      return <CourseDetailPage user={currentUser} courseId={selectedCourseId} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  }

  // Student pages
  if (currentUser.role === 'student') {
    if (currentPage === 'student-dashboard') {
      return <StudentDashboard user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'course-player' && selectedCourseId) {
      return <CoursePlayerPage user={currentUser} courseId={selectedCourseId} lessonId={selectedLessonId} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'progress') {
      return <ProgressPage user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'assessment-list') {
      return <AssessmentListPage user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'assessment-attempt' && selectedAssessmentId) {
      return <AssessmentAttemptPage user={currentUser} assessmentId={selectedAssessmentId} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  }

  // Admin pages
  if (currentUser.role === 'admin') {
    if (currentPage === 'admin-dashboard') {
      return <AdminDashboard user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'user-management') {
      return <UserManagementPage user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (currentPage === 'system-config') {
      return <SystemConfigPage user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  }

  // Default fallback
  return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
}
