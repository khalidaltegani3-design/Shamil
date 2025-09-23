"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ملفات الترجمة
const translations = {
  ar: {
    // Header
    'system_admin_panel': 'لوحة تحكم مدير النظام',
    'user_management': 'إدارة المستخدمين',
    'back': 'رجوع',
    'brand': 'رياني',
    
    // User Management
    'manage_users_roles': 'إدارة أدوار وصلاحيات المستخدمين',
    'total_users': 'إجمالي المستخدمين',
    'name': 'الاسم',
    'email': 'البريد الإلكتروني',
    'current_role': 'الدور الحالي',
    'department': 'الإدارة',
    'registration_date': 'تاريخ التسجيل',
    'actions': 'إجراءات',
    'not_specified': 'غير محدد',
    'system_admin': 'مدير النظام',
    'unknown': 'غير معروف',
    'no_users_data': 'لا توجد بيانات مستخدمين',
    
    // Roles
    'admin': 'مدير',
    'supervisor': 'مشرف',
    'employee': 'موظف',
    
    // Main Dashboard
    'welcome_system_admin': 'مرحباً بك في لوحة تحكم مدير النظام',
    'admin_description': 'يمكنك من هنا إدارة المستخدمين وتحديد أدوارهم وصلاحياتهم في النظام',
    'manage_users': 'إدارة المستخدمين',
    'view_edit_users': 'عرض وتعديل أدوار المستخدمين وإداراتهم',
    'roles_permissions': 'الصلاحيات والأدوار',
    'roles_info': 'معلومات حول أدوار المستخدمين والصلاحيات',
    'system_settings': 'إعدادات النظام',
    'general_settings': 'إعدادات عامة للنظام والصلاحيات',
    'coming_soon': 'قريباً...',
    
    // System Admin Info
    'system_admin_info': 'معلومات مدير النظام',
    'available_permissions': 'الصلاحيات المتاحة:',
    'view_all_users': 'عرض جميع المستخدمين في النظام',
    'change_user_roles': 'تغيير أدوار المستخدمين (موظف، مشرف، مدير)',
    'assign_departments': 'تحديد إدارة كل مستخدم',
    'delete_users': 'حذف المستخدمين من النظام',
    'full_system_access': 'الوصول إلى جميع أجزاء النظام',
    'available_roles': 'الأدوار المتاحة:',
    'employee_role': 'موظف: يمكنه إنشاء بلاغات للإدارات الأخرى',
    'supervisor_role': 'مشرف: يمكنه مراجعة وإغلاق البلاغات',
    'admin_role': 'مدير: يمكنه إدارة الإدارات والمشرفين',
    'system_admin_role': 'مدير النظام: صلاحيات كاملة على النظام',
    
    // Role badges
    'full_permissions': 'صلاحيات كاملة',
    'department_management': 'إدارة الإدارات',
    'review_reports': 'مراجعة البلاغات',
    'create_reports': 'إنشاء البلاغات',
    
    // Messages
    'updated': 'تم التحديث',
    'role_updated': 'تم تغيير دور المستخدم إلى',
    'department_updated': 'تم تغيير إدارة المستخدم',
    'error': 'خطأ',
    'update_role_error': 'فشل في تحديث دور المستخدم',
    'update_department_error': 'فشل في تحديث إدارة المستخدم',
    'loading_users': 'جاري تحميل بيانات المستخدمين...',
    'checking_permissions': 'جاري التحقق من الصلاحيات...',
    'failed_load_users': 'فشل في تحميل بيانات المستخدمين',
    
    // Language
    'language': 'اللغة',
    'arabic': 'العربية',
    'english': 'الإنجليزية',
  },
  en: {
    // Header
    'system_admin_panel': 'System Admin Panel',
    'user_management': 'User Management',
    'back': 'Back',
    'brand': 'Shamil',
    
    // User Management
    'manage_users_roles': 'Manage User Roles and Permissions',
    'total_users': 'Total Users',
    'name': 'Name',
    'email': 'Email',
    'current_role': 'Current Role',
    'department': 'Department',
    'registration_date': 'Registration Date',
    'actions': 'Actions',
    'not_specified': 'Not Specified',
    'system_admin': 'System Admin',
    'unknown': 'Unknown',
    'no_users_data': 'No users data',
    
    // Roles
    'admin': 'Admin',
    'supervisor': 'Supervisor',
    'employee': 'Employee',
    
    // Main Dashboard
    'welcome_system_admin': 'Welcome to System Admin Dashboard',
    'admin_description': 'You can manage users and set their roles and permissions in the system from here',
    'manage_users': 'User Management',
    'view_edit_users': 'View and edit user roles and departments',
    'roles_permissions': 'Roles & Permissions',
    'roles_info': 'Information about user roles and permissions',
    'system_settings': 'System Settings',
    'general_settings': 'General system and permission settings',
    'coming_soon': 'Coming Soon...',
    
    // System Admin Info
    'system_admin_info': 'System Admin Information',
    'available_permissions': 'Available Permissions:',
    'view_all_users': 'View all users in the system',
    'change_user_roles': 'Change user roles (employee, supervisor, admin)',
    'assign_departments': 'Assign department to each user',
    'delete_users': 'Delete users from the system',
    'full_system_access': 'Access to all parts of the system',
    'available_roles': 'Available Roles:',
    'employee_role': 'Employee: Can create reports for other departments',
    'supervisor_role': 'Supervisor: Can review and close reports',
    'admin_role': 'Admin: Can manage departments and supervisors',
    'system_admin_role': 'System Admin: Full system permissions',
    
    // Role badges
    'full_permissions': 'Full Permissions',
    'department_management': 'Department Management',
    'review_reports': 'Review Reports',
    'create_reports': 'Create Reports',
    
    // Messages
    'updated': 'Updated',
    'role_updated': 'User role changed to',
    'department_updated': 'User department updated',
    'error': 'Error',
    'update_role_error': 'Failed to update user role',
    'update_department_error': 'Failed to update user department',
    'loading_users': 'Loading users data...',
    'checking_permissions': 'Checking permissions...',
    'failed_load_users': 'Failed to load users data',
    
    // Language
    'language': 'Language',
    'arabic': 'Arabic',
    'english': 'English',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    // تحميل اللغة المحفوظة من localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ar']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}