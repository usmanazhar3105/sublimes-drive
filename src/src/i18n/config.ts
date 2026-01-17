/**
 * i18n Configuration
 * Supports: English (en), Arabic (ar), Chinese (zh-CN)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Inline translations to avoid build issues
const translations = {
  en: {
    nav: {
      home: "Home",
      marketplace: "Marketplace",
      communities: "Communities",
      events: "Events",
      garageHub: "Garage Hub",
      offers: "Offers",
      profile: "Profile",
      admin: "Admin",
      search: "Search",
      notifications: "Notifications",
      wallet: "Wallet",
      leaderboard: "Leaderboard"
    },
    auth: {
      login: "Login",
      signup: "Sign Up",
      logout: "Logout",
      welcome: "Welcome to Sublimes Drive",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      createAccount: "Create Account",
      signInWithGoogle: "Sign in with Google",
      signInWithApple: "Sign in with Apple"
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      filter: "Filter",
      sort: "Sort",
      search: "Search",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      submit: "Submit",
      back: "Back",
      next: "Next",
      done: "Done",
      close: "Close"
    }
  },
  ar: {
    nav: {
      home: "الرئيسية",
      marketplace: "السوق",
      communities: "المجتمعات",
      events: "الفعاليات",
      garageHub: "مركز الكراج",
      offers: "العروض",
      profile: "الملف الشخصي",
      admin: "الإدارة",
      search: "بحث",
      notifications: "الإشعارات",
      wallet: "المحفظة",
      leaderboard: "لوحة المتصدرين"
    },
    auth: {
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      welcome: "مرحباً بك في سبلايمز درايف",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      forgotPassword: "نسيت كلمة المرور؟",
      dontHaveAccount: "ليس لديك حساب؟",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      createAccount: "إنشاء حساب",
      signInWithGoogle: "تسجيل الدخول بواسطة جوجل",
      signInWithApple: "تسجيل الدخول بواسطة أبل"
    },
    common: {
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      view: "عرض",
      filter: "تصفية",
      sort: "ترتيب",
      search: "بحث",
      loading: "جارٍ التحميل...",
      error: "خطأ",
      success: "نجح",
      submit: "إرسال",
      back: "رجوع",
      next: "التالي",
      done: "تم",
      close: "إغلاق"
    }
  },
  'zh-CN': {
    nav: {
      home: "首页",
      marketplace: "市场",
      communities: "社区",
      events: "活动",
      garageHub: "车库中心",
      offers: "优惠",
      profile: "个人资料",
      admin: "管理",
      search: "搜索",
      notifications: "通知",
      wallet: "钱包",
      leaderboard: "排行榜"
    },
    auth: {
      login: "登录",
      signup: "注册",
      logout: "登出",
      welcome: "欢迎来到 Sublimes Drive",
      email: "电子邮件",
      password: "密码",
      confirmPassword: "确认密码",
      forgotPassword: "忘记密码？",
      dontHaveAccount: "还没有账号？",
      alreadyHaveAccount: "已有账号？",
      createAccount: "创建账号",
      signInWithGoogle: "使用 Google 登录",
      signInWithApple: "使用 Apple 登录"
    },
    common: {
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      view: "查看",
      filter: "筛选",
      sort: "排序",
      search: "搜索",
      loading: "加载中...",
      error: "错误",
      success: "成功",
      submit: "提交",
      back: "返回",
      next: "下一步",
      done: "完成",
      close: "关闭"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      ar: { translation: translations.ar },
      'zh-CN': { translation: translations['zh-CN'] },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
