import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { validateEmployeeId } from '@/lib/employee-utils';

export async function POST(request: NextRequest) {
  try {
    const { employeeId, uid } = await request.json();

    // التحقق من وجود البيانات المطلوبة
    if (!employeeId || !uid) {
      return NextResponse.json(
        { error: 'الرقم الوظيفي ومعرف المستخدم مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من صحة الرقم الوظيفي
    if (!validateEmployeeId(employeeId)) {
      return NextResponse.json(
        { error: 'الرقم الوظيفي غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من تفرد الرقم الوظيفي
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('employeeId', '==', employeeId.trim()));
    const querySnapshot = await getDocs(q);
    
    // التحقق من عدم وجود المستخدم بنفس الرقم الوظيفي (باستثناء المستخدم الحالي)
    const duplicateUser = querySnapshot.docs.find(doc => doc.id !== uid);
    if (duplicateUser) {
      return NextResponse.json(
        { error: 'هذا الرقم الوظيفي مستخدم بالفعل' },
        { status: 409 }
      );
    }

    // التحقق من وجود المستخدم
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // تحديث الرقم الوظيفي
    await updateDoc(doc(db, 'users', uid), {
      employeeId: employeeId.trim(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الرقم الوظيفي بنجاح',
      employeeId: employeeId.trim()
    });

  } catch (error) {
    console.error('خطأ في تحديث الرقم الوظيفي:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const excludeUid = searchParams.get('excludeUid');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'الرقم الوظيفي مطلوب' },
        { status: 400 }
      );
    }

    // التحقق من تفرد الرقم الوظيفي
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('employeeId', '==', employeeId.trim()));
    const querySnapshot = await getDocs(q);
    
    // التحقق من عدم وجود المستخدم بنفس الرقم الوظيفي (باستثناء المستخدم المحدد)
    const duplicateUser = querySnapshot.docs.find(doc => doc.id !== excludeUid);
    const isUnique = !duplicateUser;

    return NextResponse.json({
      isUnique,
      message: isUnique ? 'الرقم الوظيفي متاح' : 'الرقم الوظيفي مستخدم بالفعل'
    });

  } catch (error) {
    console.error('خطأ في التحقق من تفرد الرقم الوظيفي:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}