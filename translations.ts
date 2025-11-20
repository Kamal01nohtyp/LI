import { IssueStatus } from './types';

export const translations = {
  en: {
    appTitle: "LiquidTrack",
    newIssue: "New Issue",
    searchPlaceholder: "Search issues...",
    activeRecords: "active records",
    emptyState: "No issues found. Create a new one to get started.",
    tableHeaders: {
      issue: "Issue",
      status: "Status",
      date: "Date",
      responsible: "Responsible",
      actions: "Actions"
    },
    buttons: {
      delete: "Delete Issue",
      aiSuggest: "Get AI Suggestion",
      cancel: "Cancel",
      create: "Create Record",
      logout: "Sign Out"
    },
    modal: {
      title: "New Issue Record",
      labelTitle: "Problem Title",
      placeholderTitle: "e.g. Spare part delivery delay",
      labelDesc: "Description",
      placeholderDesc: "Describe the situation...",
      labelResponsible: "Responsible Person"
    },
    statuses: {
      [IssueStatus.NEW]: "New",
      [IssueStatus.IN_PROGRESS]: "In Progress",
      [IssueStatus.CUSTOMS]: "At Customs",
      [IssueStatus.DELIVERY]: "Delivery",
      [IssueStatus.DONE]: "Done",
      [IssueStatus.STUCK]: "Stuck"
    },
    confirmDelete: "Are you sure you want to delete this record?",
    auth: {
      welcome: "Welcome to LiquidTrack",
      subtitle: "Manage your logistics efficiently.",
      emailLabel: "Email address",
      passwordLabel: "Password",
      signIn: "Sign In",
      signUp: "Sign Up",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      microsoftBtn: "Continue with Microsoft",
      loading: "Processing...",
      errorParams: "Please check your email and password."
    }
  },
  ru: {
    appTitle: "LiquidTrack",
    newIssue: "Новая задача",
    searchPlaceholder: "Поиск проблем...",
    activeRecords: "активных задач",
    emptyState: "Задач нет. Создайте новую, чтобы начать.",
    tableHeaders: {
      issue: "Проблема",
      status: "Статус",
      date: "Дата",
      responsible: "Ответственный",
      actions: "Действия"
    },
    buttons: {
      delete: "Удалить",
      aiSuggest: "Анализ AI",
      cancel: "Отмена",
      create: "Создать запись",
      logout: "Выйти"
    },
    modal: {
      title: "Новая запись о проблеме",
      labelTitle: "Заголовок проблемы",
      placeholderTitle: "например, Задержка запчасти",
      labelDesc: "Описание",
      placeholderDesc: "Опишите ситуацию подробно...",
      labelResponsible: "Ответственный сотрудник"
    },
    statuses: {
      [IssueStatus.NEW]: "Новая",
      [IssueStatus.IN_PROGRESS]: "В работе",
      [IssueStatus.CUSTOMS]: "На таможне",
      [IssueStatus.DELIVERY]: "Доставка",
      [IssueStatus.DONE]: "Готово",
      [IssueStatus.STUCK]: "Проблема"
    },
    confirmDelete: "Вы уверены, что хотите удалить эту запись?",
    auth: {
      welcome: "Добро пожаловать",
      subtitle: "Управляйте логистикой эффективно.",
      emailLabel: "Email адрес",
      passwordLabel: "Пароль",
      signIn: "Войти",
      signUp: "Регистрация",
      noAccount: "Нет аккаунта?",
      hasAccount: "Уже есть аккаунт?",
      microsoftBtn: "Войти через Microsoft",
      loading: "Обработка...",
      errorParams: "Пожалуйста, проверьте email и пароль."
    }
  }
};

export type Language = 'en' | 'ru';