export const initialUsers = [
    { id: "E-1023", name: "خالد الأحمد", email: "k.ahmed@example.com", role: "admin" as const, status: "نشط" as "نشط" | "غير نشط", homeDepartmentId: "executive-management", supervisorOf: ["it-support", "maintenance"] },
    { id: "E-1029", name: "نورة القحطاني", email: "n.qahtani@example.com", role: "supervisor" as const, status: "نشط" as "نشط" | "غير نشط", homeDepartmentId: "it-support", supervisorOf: ["it-support"] },
    { id: "E-1035", name: "سلطان العتيبي", email: "s.otaibi@example.com", role: "employee" as const, status: "غير نشط" as "نشط" | "غير نشط", homeDepartmentId: "general-services", supervisorOf: [] },
    { id: "E-1041", name: "أحمد الغامدي", email: "a.ghamdi@example.com", role: "supervisor" as const, status: "نشط" as "نشط" | "غير نشط", homeDepartmentId: "maintenance", supervisorOf: ["maintenance"] },
    { id: "E-1048", name: "فاطمة الزهراني", email: "f.zahrani@example.com", role: "employee" as const, status: "نشط" as "نشط" | "غير نشط", homeDepartmentId: "human-resources", supervisorOf: [] },
];
