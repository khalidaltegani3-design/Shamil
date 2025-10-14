"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Users, Mail, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { NotificationService, NotificationMessage } from '@/lib/notification-service';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'login_issue' | 'password_reset' | 'system_update' | 'general' | 'urgent'>('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'sms' | 'push' | 'in_app'>('email');

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  const loadNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const notificationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationMessage[];
      setNotifications(notificationData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const userData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    const templates = NotificationService.getNotificationTemplates();
    const template = templates[templateKey as keyof typeof templates];
    
    if (template) {
      setSelectedTemplate(templateKey);
      setCustomTitle(template.title);
      setCustomMessage(template.message);
      setNotificationType(template.type);
      setPriority(template.priority);
    }
  };

  const sendNotification = async () => {
    if (!selectedUser || !customTitle || !customMessage) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = users.find(u => u.id === selectedUser);
      
      await NotificationService.sendUserNotification({
        userEmail: user.email,
        title: customTitle,
        message: customMessage,
        type: notificationType,
        priority: priority,
        deliveryMethod: deliveryMethod,
        metadata: {
          userRole: user.role,
          department: user.department
        }
      });

      setSuccess(`تم إرسال الإشعار بنجاح إلى ${user.email}`);
      
      // Reset form
      setSelectedUser('');
      setSelectedTemplate('');
      setCustomTitle('');
      setCustomMessage('');
      
      // Reload notifications
      await loadNotifications();
      
    } catch (error) {
      setError('فشل في إرسال الإشعار');
      console.error('Send notification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendSystemUpdateToAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await NotificationService.sendSystemUpdateToAllUsers();
      setSuccess(`تم إرسال إشعار التحديث إلى ${result.successful} مستخدم بنجاح`);
      await loadNotifications();
    } catch (error) {
      setError('فشل في إرسال إشعار التحديث للجميع');
      console.error('Send system update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> في الانتظار</Badge>;
      case 'sent':
        return <Badge variant="default" className="flex items-center gap-1"><Send className="h-3 w-3" /> مرسل</Badge>;
      case 'delivered':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> تم التسليم</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> فشل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">عاجل</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-orange-500">عالي</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-blue-500">متوسط</Badge>;
      case 'low':
        return <Badge variant="secondary">منخفض</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإشعارات</h1>
          <p className="text-muted-foreground">إرسال وإدارة رسائل الإشعارات للمستخدمين</p>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">إرسال إشعار</TabsTrigger>
          <TabsTrigger value="history">سجل الإشعارات</TabsTrigger>
          <TabsTrigger value="templates">القوالب</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إرسال إشعار جديد</CardTitle>
              <CardDescription>إرسال رسالة إشعار لمستخدم محدد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user">المستخدم</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستخدم" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{user.email}</span>
                            <Badge variant="outline" className="text-xs">{user.role}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">نوع الرسالة</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الرسالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="login_issue">مشكلة تسجيل الدخول</SelectItem>
                      <SelectItem value="password_reset">إعادة تعيين كلمة المرور</SelectItem>
                      <SelectItem value="system_update">تحديث النظام</SelectItem>
                      <SelectItem value="urgent_maintenance">صيانة عاجلة</SelectItem>
                      <SelectItem value="custom">مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع الإشعار</Label>
                  <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">عام</SelectItem>
                      <SelectItem value="login_issue">مشكلة تسجيل دخول</SelectItem>
                      <SelectItem value="password_reset">إعادة تعيين كلمة مرور</SelectItem>
                      <SelectItem value="system_update">تحديث النظام</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                      <SelectItem value="urgent">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">عنوان الرسالة</Label>
                <Input
                  id="title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="أدخل عنوان الرسالة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">نص الرسالة</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="أدخل نص الرسالة"
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={sendNotification} disabled={loading} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {loading ? 'جاري الإرسال...' : 'إرسال الإشعار'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={sendSystemUpdateToAll} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  إرسال تحديث للجميع
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل الإشعارات</CardTitle>
              <CardDescription>عرض جميع الإشعارات المرسلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="font-medium">{notification.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(notification.status)}
                        {getPriorityBadge(notification.priority)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message.substring(0, 100)}...
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>النوع: {notification.type}</span>
                      <span>طريقة الإرسال: {notification.deliveryMethod}</span>
                      <span>
                        {notification.createdAt?.toDate?.()?.toLocaleString('ar-SA') || 
                         new Date(notification.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قوالب الرسائل</CardTitle>
              <CardDescription>عرض قوالب الرسائل المتاحة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(NotificationService.getNotificationTemplates()).map(([key, template]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{template.title}</h4>
                      <div className="flex gap-1">
                        <Badge variant="outline">{template.type}</Badge>
                        {getPriorityBadge(template.priority)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.message.substring(0, 150)}...
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTemplateChange(key)}
                    >
                      استخدام هذا القالب
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


