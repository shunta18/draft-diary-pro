import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MessageSquare } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "お名前を入力してください").max(100, "お名前は100文字以内で入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください").max(255, "メールアドレスは255文字以内で入力してください"),
  subject: z.string().min(1, "件名を入力してください").max(200, "件名は200文字以内で入力してください"),
  message: z.string().min(10, "メッセージは10文字以上入力してください").max(2000, "メッセージは2000文字以内で入力してください"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([{
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        }]);

      if (error) throw error;

      toast.success("お問い合わせを送信しました", {
        description: "ご連絡ありがとうございます。内容を確認次第、ご返信いたします。",
      });
      reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("送信に失敗しました", {
        description: "しばらく時間をおいて再度お試しください。",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <SEO
        title="お問い合わせ"
        description="BaaS 野球スカウトノートへのお問い合わせはこちら。ご質問、ご要望、不具合報告など、お気軽にご連絡ください。"
        keywords={["お問い合わせ", "コンタクト", "サポート", "野球スカウト", "BaaS"]}
        url="https://baas-baseball.com/contact"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">お問い合わせ</h1>
            <p className="text-muted-foreground text-lg">
              ご質問、ご要望、不具合報告など、お気軽にご連絡ください
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  メールでのお問い合わせ
                </CardTitle>
                <CardDescription>
                  下記フォームよりお問い合わせください
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  対応時間
                </CardTitle>
                <CardDescription>
                  通常2-3営業日以内にご返信いたします
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>お問い合わせフォーム</CardTitle>
              <CardDescription>
                必要事項をご記入の上、送信してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">お名前 *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="山田 太郎"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="example@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">件名 *</Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder="お問い合わせ内容の簡潔な要約"
                    className={errors.subject ? "border-destructive" : ""}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">メッセージ *</Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="お問い合わせ内容を詳しくご記入ください"
                    rows={8}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "送信中..." : "送信する"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
