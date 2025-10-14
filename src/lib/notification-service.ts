// Notification Service for User Communications
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface NotificationMessage {
  id?: string;
  userId?: string;
  userEmail: string;
  title: string;
  message: string;
  type: 'login_issue' | 'password_reset' | 'system_update' | 'general' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  createdAt?: any;
  sentAt?: any;
  deliveryMethod: 'email' | 'sms' | 'push' | 'in_app';
  metadata?: {
    loginAttempts?: number;
    lastLogin?: any;
    userRole?: string;
    department?: string;
  };
}

export class NotificationService {
  
  // Send notification to specific user
  static async sendUserNotification(notification: Omit<NotificationMessage, 'id' | 'createdAt' | 'status'>) {
    try {
      const notificationData = {
        ...notification,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        sentAt: null
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      
      // Log the notification
      console.log(`📧 Notification queued for ${notification.userEmail}: ${notification.title}`);
      
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  }

  // Send bulk notifications to multiple users
  static async sendBulkNotifications(notifications: Omit<NotificationMessage, 'id' | 'createdAt' | 'status'>[]) {
    try {
      const promises = notifications.map(notification => 
        this.sendUserNotification(notification)
      );
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      console.log(`📊 Bulk notification results: ${successful} sent, ${failed} failed`);
      
      return { successful, failed, results };
    } catch (error) {
      console.error('❌ Failed to send bulk notifications:', error);
      throw error;
    }
  }

  // Get notifications for a specific user
  static async getUserNotifications(userEmail: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userEmail', '==', userEmail),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationMessage[];
      
      return notifications;
    } catch (error) {
      console.error('❌ Failed to get user notifications:', error);
      throw error;
    }
  }

  // Get all pending notifications
  static async getPendingNotifications() {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationMessage[];
      
      return notifications;
    } catch (error) {
      console.error('❌ Failed to get pending notifications:', error);
      throw error;
    }
  }

  // Predefined notification templates
  static getNotificationTemplates() {
    return {
      login_issue: {
        title: 'مشكلة في تسجيل الدخول - بلدية الريان',
        message: `مرحباً،

تم رصد مشكلة في تسجيل دخولك للنظام. يرجى تجربة الحلول التالية:

1. اضغط على "نسيت كلمة المرور؟"
2. تحقق من بريدك الإلكتروني للرسالة الجديدة
3. امسح ذاكرة التخزين المؤقت للمتصفح
4. جرب متصفح آخر أو وضع التصفح الخفي

إذا لم تحل المشكلة، يرجى التواصل مع مدير النظام.

مع أطيب التحيات،
فريق الدعم الفني - بلدية الريان`,
        type: 'login_issue' as const,
        priority: 'high' as const
      },
      
      password_reset: {
        title: 'إعادة تعيين كلمة المرور - بلدية الريان',
        message: `مرحباً،

تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.

يرجى:
1. التحقق من صندوق الوارد
2. فحص مجلد الرسائل المزعجة (Spam)
3. النقر على الرابط المرفق
4. إدخال كلمة مرور جديدة

إذا لم تستلم الرسالة خلال 10 دقائق، يرجى التواصل معنا.

مع أطيب التحيات،
فريق الدعم الفني - بلدية الريان`,
        type: 'password_reset' as const,
        priority: 'urgent' as const
      },
      
      system_update: {
        title: 'تحديث النظام - بلدية الريان',
        message: `مرحباً،

نود إعلامكم بأنه تم تحديث نظام البلاغات الداخلية بنجاح.

التحديثات الجديدة تشمل:
- تحسينات في واجهة المستخدم
- إضافة ميزات جديدة
- إصلاح بعض المشاكل التقنية

يرجى تسجيل الدخول لتجربة الميزات الجديدة.

مع أطيب التحيات،
فريق التطوير - بلدية الريان`,
        type: 'system_update' as const,
        priority: 'medium' as const
      },
      
      urgent_maintenance: {
        title: 'صيانة عاجلة للنظام - بلدية الريان',
        message: `تنبيه عاجل:

سيتم إجراء صيانة عاجلة على النظام في أقرب وقت ممكن.

يرجى:
1. حفظ أي عمل غير محفوظ
2. تسجيل الخروج من النظام
3. عدم محاولة الدخول أثناء الصيانة

سيتم إشعاركم عند انتهاء الصيانة.

مع أطيب التحيات،
فريق الدعم الفني - بلدية الريان`,
        type: 'urgent' as const,
        priority: 'urgent' as const
      }
    };
  }

  // Send login issue notification
  static async sendLoginIssueNotification(userEmail: string, attemptsLeft: number = 1) {
    const template = this.getNotificationTemplates().login_issue;
    
    return await this.sendUserNotification({
      userEmail,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      deliveryMethod: 'email',
      metadata: {
        loginAttempts: attemptsLeft,
        lastLogin: new Date().toISOString()
      }
    });
  }

  // Send password reset notification
  static async sendPasswordResetNotification(userEmail: string) {
    const template = this.getNotificationTemplates().password_reset;
    
    return await this.sendUserNotification({
      userEmail,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      deliveryMethod: 'email'
    });
  }

  // Send system update notification to all users
  static async sendSystemUpdateToAllUsers() {
    const template = this.getNotificationTemplates().system_update;
    
    // Get all users from Firestore
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    const notifications = usersSnapshot.docs.map(doc => ({
      userEmail: doc.data().email,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      deliveryMethod: 'email' as const,
      metadata: {
        userRole: doc.data().role,
        department: doc.data().department
      }
    }));
    
    return await this.sendBulkNotifications(notifications);
  }
}
