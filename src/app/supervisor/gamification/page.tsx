import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

// Mock data for gamification rules
const rules = [
    { id: "submit_report", label: "تقديم بلاغ جديد", points: 10 },
    { id: "report_accepted", label: "قبول البلاغ من المشرف", points: 20 },
    { id: "report_resolved_quickly", label: "حل البلاغ في أقل من 24 ساعة", points: 50 },
    { id: "provide_feedback", label: "تقديم تقييم على حل البلاغ", points: 5 },
    { id: "report_rejected", label: "رفض البلاغ (خصم نقاط)", points: -15 },
    { id: "suggestion_accepted", label: "قبول اقتراح مقدم", points: 100 },
];

export default function GamificationSettingsPage() {
  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">إعدادات النقاط والمكافآت</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>قواعد منح النقاط</CardTitle>
          <CardDescription>
            حدد القيم الرقمية لكل حدث داخل النظام لتحفيز الموظفين على التفاعل الإيجابي.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rules.map((rule) => (
                <div key={rule.id} className="space-y-2">
                  <Label htmlFor={rule.id}>{rule.label}</Label>
                  <Input 
                    id={rule.id} 
                    type="number" 
                    defaultValue={rule.points}
                    className="text-left dir-ltr"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button>
                <Save className="ml-2 h-4 w-4" />
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
