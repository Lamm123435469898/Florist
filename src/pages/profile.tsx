import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { toast } from "sonner";
import { User, Lock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", phoneNumber: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/users/profile");
      if (data.success) {
        setProfile({
          fullName: data.data.fullName || "",
          phoneNumber: data.data.phoneNumber || "",
          email: data.data.email || ""
        });
      }
    } catch {
      toast.error("Không thể tải thông tin tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await apiClient.put("/users/profile", {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber
      });
      if (data.success) {
        toast.success("Cập nhật thông tin thành công");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }
    
    try {
      setSavingPassword(true);
      const { data } = await apiClient.post("/users/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (data.success) {
        toast.success("Đổi mật khẩu thành công");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Mật khẩu hiện tại không đúng");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />
      <main className="flex-1 py-12 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-serif text-slate-800 mb-8">Tài khoản của tôi</h1>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Thông tin cá nhân */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-medium text-slate-800">Thông tin cá nhân</h2>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email (Không thể thay đổi)</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Lưu thay đổi
                </Button>
              </form>
            </div>

            {/* Đổi mật khẩu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-medium text-slate-800">Đổi mật khẩu</h2>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <Button type="submit" disabled={savingPassword} variant="outline" className="w-full mt-4">
                  {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Cập nhật mật khẩu
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
