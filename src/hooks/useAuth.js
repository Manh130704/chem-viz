import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Lắng nghe thay đổi auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  };

  // Đăng ký học sinh
  const signUpStudent = async ({ email, password, fullName, className }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Tạo profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id:         data.user.id,
      full_name:  fullName,
      class_name: className,
      role:       "student",
    });
    if (profileError) throw profileError;
    return data;
  };

  // Đăng ký giáo viên (cần mã xác nhận)
  const signUpTeacher = async ({ email, password, fullName, teacherCode }) => {
    if (teacherCode !== "CHEMVIZ2025") throw new Error("Mã giáo viên không đúng!");

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    const { error: profileError } = await supabase.from("profiles").insert({
      id:         data.user.id,
      full_name:  fullName,
      class_name: "Giáo viên",
      role:       "teacher",
    });
    if (profileError) throw profileError;
    return data;
  };

  // Đăng nhập
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // Đăng xuất
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUpStudent, signUpTeacher, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}