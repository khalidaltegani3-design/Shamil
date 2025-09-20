"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Shield, Users } from 'lucide-react';

interface User {
  id: string;
  displayName?: string;
  email?: string;
  role?: string;
}

export default function CleanupPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersList);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      setMessage('خطأ في جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const cleanupUsers = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع المستخدمين عدا مديري النظام؟')) {
      return;
    }

    setDeleting(true);
    let deletedCount = 0;
    let systemAdminCount = 0;

    try {
      for (const user of users) {
        if (user.role === 'system-admin') {
          systemAdminCount++;
          continue;
        }

        try {
          await deleteDoc(doc(db, 'users', user.id));
          deletedCount++;
          console.log(`حذف المستخدم: ${user.displayName || user.email}`);
        } catch (error) {
          console.error(`فشل في حذف المستخدم ${user.displayName || user.email}:`, error);
        }
      }

      setMessage(`تم حذف ${deletedCount} مستخدم. تم الاحتفاظ بـ ${systemAdminCount} مدير نظام.`);
      await loadUsers(); // إعادة تحميل القائمة
    } catch (error) {
      console.error('خطأ في عملية التنظيف:', error);
      setMessage('حدث خطأ أثناء عملية التنظيف');
    } finally {
      setDeleting(false);
    }
  };

  const systemAdmins = users.filter(user => user.role === 'system-admin');
  const otherUsers = users.filter(user => user.role !== 'system-admin');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظيف قاعدة البيانات</h1>
          <p className="text-gray-600">حذف جميع المستخدمين عدا مديري النظام لتسليم المشروع نظيفاً</p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                مديرو النظام (سيتم الاحتفاظ بهم)
              </CardTitle>
              <CardDescription>
                عدد المديرين: {systemAdmins.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemAdmins.map(admin => (
                  <div key={admin.id} className="p-2 bg-green-50 rounded border border-green-200">
                    <p className="font-medium">{admin.displayName || 'بدون اسم'}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                المستخدمون الآخرون (سيتم حذفهم)
              </CardTitle>
              <CardDescription>
                عدد المستخدمين: {otherUsers.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {otherUsers.map(user => (
                  <div key={user.id} className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="font-medium">{user.displayName || 'بدون اسم'}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.role || 'بدون دور'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={cleanupUsers}
            disabled={deleting || otherUsers.length === 0}
            variant="destructive"
            size="lg"
            className="px-8"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري الحذف...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                حذف {otherUsers.length} مستخدم
              </>
            )}
          </Button>
          
          {otherUsers.length === 0 && (
            <p className="mt-4 text-green-600 font-medium">
              ✅ تم تنظيف قاعدة البيانات - لا يوجد مستخدمون للحذف
            </p>
          )}
        </div>
      </div>
    </div>
  );
}