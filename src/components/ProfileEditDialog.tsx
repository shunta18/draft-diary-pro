import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { updateProfile, uploadAvatar, Profile, SocialLink } from "@/lib/supabase-storage";
import { Loader2, Plus, X, Upload, Twitter, Youtube, Link as LinkIcon } from "lucide-react";

const profileSchema = z.object({
  display_name: z.string()
    .min(1, "ユーザー名は必須です")
    .max(50, "ユーザー名は50文字以内で入力してください"),
  bio: z.string()
    .max(300, "紹介文は300文字以内で入力してください")
    .optional(),
  social_links: z.array(z.object({
    type: z.enum(['twitter', 'youtube', 'other']),
    label: z.string().max(20).optional(),
    url: z.string().url("有効なURLを入力してください")
  })).max(5, "リンクは最大5個までです").optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditDialogProps {
  profile: Profile | null;
  onProfileUpdate: () => void;
}

export const ProfileEditDialog = ({ profile, onProfileUpdate }: ProfileEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: "",
      bio: "",
      social_links: []
    }
  });

  // Reset form when dialog opens with current profile data
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      form.reset({
        display_name: profile?.display_name || "",
        bio: profile?.bio || "",
        social_links: (profile?.social_links || []) as SocialLink[]
      });
      setAvatarPreview(profile?.avatar_url || null);
      setAvatarFile(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "エラー",
        description: "画像サイズは2MB以下にしてください",
        variant: "destructive"
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    const currentLinks = form.getValues("social_links") || [];
    if (currentLinks.length >= 5) {
      toast({
        title: "エラー",
        description: "リンクは最大5個までです",
        variant: "destructive"
      });
      return;
    }
    const newLink: SocialLink = { type: "other" as const, url: "", label: "" };
    form.setValue("social_links", [...currentLinks, newLink]);
  };

  const removeLink = (index: number) => {
    const currentLinks = form.getValues("social_links") || [];
    form.setValue("social_links", currentLinks.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const success = await updateProfile({
        display_name: values.display_name,
        bio: values.bio,
        avatar_url: avatarUrl,
        social_links: (values.social_links || []) as SocialLink[]
      });

      if (success) {
        toast({
          title: "成功",
          description: "プロフィールを更新しました"
        });
        setOpen(false);
        onProfileUpdate();
      } else {
        throw new Error("Profile update failed");
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">プロフィール編集</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>プロフィール画像</Label>
              <div className="flex items-center gap-4">
                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent">
                      <Upload className="w-4 h-4" />
                      <span>画像を選択</span>
                    </div>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WEBP (最大2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ユーザー名</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ユーザー名を入力" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>紹介文</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="自己紹介を入力してください"
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {(field.value?.length || 0)}/300
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>リンク</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLink}
                  disabled={(form.watch("social_links")?.length || 0) >= 5}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  追加
                </Button>
              </div>

              {form.watch("social_links")?.map((link, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`social_links.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="twitter">Twitter</option>
                            <option value="youtube">YouTube</option>
                            <option value="other">その他</option>
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch(`social_links.${index}.type`) === 'other' && (
                    <FormField
                      control={form.control}
                      name={`social_links.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="ラベル" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`social_links.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                保存
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
