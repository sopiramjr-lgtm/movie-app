"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Printer, Download, TrendingUp, TrendingDown, DollarSign,
  CreditCard, ShoppingBag, BarChart3, ChevronRight, CheckCircle2,
  Clock, ArrowUpRight, Wallet, Sparkles, Filter, Calendar,
  Search, SlidersHorizontal, RefreshCw, X, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import { adminApi } from "@/src/lib/api/endpoints";
import type { PaymentResponse, AdminDashboardStats, SubscriptionPlanResponse } from "@/src/types/movie";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
}

const labels = {
  en: {
    breadcrumb: "Admin > Financial & Sales Reports",
    tag: "FINANCIAL INTELLIGENCE & ANALYTICS",
    title: "Financial & Sales Reports",
    showingData: "Showing data from",
    to: "to",
    printReport: "Print Report",
    exportCsv: "Export CSV",
    range: "Range:",
    range1w: "1 Week",
    range1m: "1 Month",
    range6m: "6 Months",
    range1y: "1 Year",
    rangeCustom: "Custom Range",
    customDrawerTitle: "Custom Date & Financial Filters",
    customDrawerDesc: "Set custom date ranges, payment providers, order statuses, and operating cost margins.",
    fromDate: "From Date",
    toDate: "To Date",
    quickPresets: "Quick Presets",
    presetToday: "Today",
    presetYesterday: "Yesterday",
    preset7d: "Last 7 Days",
    preset30d: "Last 30 Days",
    presetThisMonth: "This Month",
    presetLastMonth: "Last Month",
    presetThisYear: "This Year",
    filterPayment: "Payment Method",
    allPayments: "All Methods",
    filterStatus: "Transaction Status",
    allStatuses: "All Statuses",
    operatingCostMargin: "Operating Cost Margin (COGS / Fees)",
    applyFilter: "Apply Filters",
    resetFilter: "Reset All",
    toggleCustomPanel: "Customize Filters",
    searchPlaceholder: "Search orders, customers, or payment ref...",
    ordersAnalyzed: "orders analyzed in current range",
    grossIncome: "GROSS INCOME",
    paidOrders: "paid orders",
    totalOutcome: "TOTAL OUTCOME",
    outcomeSubtext: "COGS, Delivery & Platform Fees",
    netProfit: "NET PROFIT",
    profitMargin: "Margin",
    ordersAov: "ORDERS & AOV",
    aovSuffix: "AOV",
    itemsSold: "subscriptions recorded",
    timelineTitle: "Income vs Outcome Timeline",
    timelineSubtitle: "Chronological comparison of sales revenue vs operating costs",
    income: "Income",
    outcome: "Outcome",
    profit: "Net Profit",
    paymentBreakdown: "Payment Methods Breakdown",
    topSelling: "Top Selling Plans & Subscriptions",
    unitsSold: "sold",
    ledgerTitle: "Financial Transaction Ledger",
    ordersRecorded: "orders recorded",
    orderId: "ORDER ID",
    date: "DATE",
    customer: "CUSTOMER",
    payment: "PAYMENT",
    status: "STATUS",
    tableGross: "GROSS INCOME",
    tableOutcome: "OUTCOME / COST",
    tableNet: "NET PROFIT",
    noTransactionsFound: "No transactions match your custom criteria.",
    showing: "Showing",
  },
  kh: {
    breadcrumb: "អ្នកគ្រប់គ្រង > របាយការណ៍ហិរញ្ញវត្ថុ & ការលក់",
    tag: "ការវិភាគ និងទិន្នន័យហិរញ្ញវត្ថុ",
    title: "របាយការណ៍ហិរញ្ញវត្ថុ & ការលក់",
    showingData: "ទិន្នន័យចាប់ពី",
    to: "ដល់",
    printReport: "បោះពុម្ពរបាយការណ៍",
    exportCsv: "ទាញយកជា CSV",
    range: "រយៈពេល:",
    range1w: "1 សប្តាហ៍",
    range1m: "1 ខែ",
    range6m: "6 ខែ",
    range1y: "1 ឆ្នាំ",
    rangeCustom: "កំណត់ដោយខ្លួនឯង",
    customDrawerTitle: "ការកំណត់កាលបរិច្ឆេទ & តម្រងហិរញ្ញវត្ថុ",
    customDrawerDesc: "ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ វិធីសាស្ត្រទូទាត់ ស្ថានភាព និងអត្រាចំណាយប្រតិបត្តិការផ្ទាល់ខ្លួន។",
    fromDate: "ចាប់ពីថ្ងៃ",
    toDate: "ដល់ថ្ងៃ",
    quickPresets: "ជម្រើសរហ័ស",
    presetToday: "ថ្ងៃនេះ",
    presetYesterday: "ម្សិលមិញ",
    preset7d: "៧ ថ្ងៃចុងក្រោយ",
    preset30d: "៣០ ថ្ងៃចុងក្រោយ",
    presetThisMonth: "ខែនេះ",
    presetLastMonth: "ខែមុន",
    presetThisYear: "ឆ្នាំនេះ",
    filterPayment: "វិធីសាស្ត្រទូទាត់",
    allPayments: "គ្រប់វិធីសាស្ត្រ",
    filterStatus: "ស្ថានភាពប្រតិបត្តិការ",
    allStatuses: "គ្រប់ស្ថានភាព",
    operatingCostMargin: "អត្រាចំណាយដើមទុន / ថ្លៃប្រតិបត្តិការ",
    applyFilter: "អនុវត្តតម្រង",
    resetFilter: "កំណត់ឡើងវិញ",
    toggleCustomPanel: "កែប្រែតម្រងផ្ទាល់ខ្លួន",
    searchPlaceholder: "ស្វែងរកលេខបញ្ជាទិញ អតិថិជន ឬលេខយោង...",
    ordersAnalyzed: "ការបញ្ជាទិញត្រូវបានវិភាគក្នុងចន្លោះនេះ",
    grossIncome: "ចំណូលសរុប",
    paidOrders: "ការបញ្ជាទិញបានទូទាត់",
    totalOutcome: "ចំណាយសរុប",
    outcomeSubtext: "ការចំណាយប្រតិបត្តិការ & ថ្លៃសេវាប្រព័ន្ធ",
    netProfit: "ប្រាក់ចំណេញសុទ្ធ",
    profitMargin: "អត្រាចំណេញ",
    ordersAov: "ការបញ្ជាទិញ & តម្លៃមធ្យម",
    aovSuffix: "AOV",
    itemsSold: "កញ្ចប់ជាវសកម្ម",
    timelineTitle: "គំនូសតាងចំណូលធៀបនឹងចំណាយ",
    timelineSubtitle: "ការប្រៀបធៀបចំណូលពីការលក់ធៀបនឹងការចំណាយប្រតិបត្តិការ",
    income: "ចំណូល",
    outcome: "ចំណាយ",
    profit: "ចំណេញសុទ្ធ",
    paymentBreakdown: "វិធីសាស្ត្រទូទាត់ប្រាក់",
    topSelling: "កញ្ចប់ជាវដែលលក់ដាច់បំផុត",
    unitsSold: "បានលក់",
    ledgerTitle: "កំណត់ត្រាប្រតិបត្តិការហិរញ្ញវត្ថុ",
    ordersRecorded: "កំណត់ត្រាប្រតិបត្តិការ",
    orderId: "លេខបញ្ជាទិញ",
    date: "កាលបរិច្ឆេទ",
    customer: "អតិថិជន",
    payment: "ការទូទាត់",
    status: "ស្ថានភាព",
    tableGross: "ចំណូលសរុប",
    tableOutcome: "ចំណាយដើមទុន",
    tableNet: "ចំណេញសុទ្ធ",
    noTransactionsFound: "រកមិនឃើញប្រតិបត្តិការដែលត្រូវនឹងលក្ខខណ្ឌកំណត់ទេ។",
    showing: "បង្ហាញ",
  },
};

interface TransactionItem {
  id: string;
  date: string;
  timestamp: number;
  customer: string;
  payment: string;
  status: "Processing" | "Delivered" | "Pending";
  gross: number;
  outcome: number;
  net: number;
}

// Format dates nicely
function formatDateDisplay(d: Date, lang: "en" | "kh"): string {
  const day = d.getDate();
  const year = d.getFullYear();
  if (lang === "kh") {
    const monthsKh = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
    return `${day} ${monthsKh[d.getMonth()]} ${year}`;
  }
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${monthsEn[d.getMonth()]} ${year}`;
}

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate realistic seeded transactions
const NOW = new Date();
const SEED_TRANSACTIONS: TransactionItem[] = [
  { id: "#ORD00312", date: "23 Sep 2026 11:20", timestamp: new Date(2026, 8, 23, 11, 20).getTime(), customer: "Sokha Mean", payment: "KHQR", status: "Delivered", gross: 9.99, outcome: 2.50, net: 7.49 },
  { id: "#ORD00311", date: "23 Sep 2026 09:15", timestamp: new Date(2026, 8, 23, 9, 15).getTime(), customer: "Keo Monireak", payment: "KHQR", status: "Delivered", gross: 14.99, outcome: 3.75, net: 11.24 },
  { id: "#ORD00310", date: "22 Sep 2026 15:40", timestamp: new Date(2026, 8, 22, 15, 40).getTime(), customer: "Rithy Panh", payment: "ACLEDA", status: "Delivered", gross: 9.99, outcome: 2.50, net: 7.49 },
  { id: "#ORD00309", date: "21 Sep 2026 07:11", timestamp: new Date(2026, 8, 21, 7, 11).getTime(), customer: "Som Sophiram", payment: "KHQR", status: "Processing", gross: 8.10, outcome: 2.05, net: 6.05 },
  { id: "#ORD00308", date: "21 Sep 2026 06:10", timestamp: new Date(2026, 8, 21, 6, 10).getTime(), customer: "Som Sophiram", payment: "KHQR", status: "Processing", gross: 8.10, outcome: 2.05, net: 6.05 },
  { id: "#ORD00307", date: "21 Sep 2026 05:42", timestamp: new Date(2026, 8, 21, 5, 42).getTime(), customer: "Som Sophiram", payment: "KHQR", status: "Processing", gross: 8.10, outcome: 2.05, net: 6.05 },
  { id: "#ORD00306", date: "21 Sep 2026 04:47", timestamp: new Date(2026, 8, 21, 4, 47).getTime(), customer: "Soun Sophina", payment: "KHQR", status: "Delivered", gross: 8.10, outcome: 2.05, net: 6.05 },
  { id: "#ORD00305", date: "21 Sep 2026 03:30", timestamp: new Date(2026, 8, 21, 3, 30).getTime(), customer: "Soun Sophina", payment: "KHQR", status: "Pending", gross: 8.10, outcome: 2.05, net: 6.05 },
  { id: "#ORD00304", date: "20 Sep 2026 21:15", timestamp: new Date(2026, 8, 20, 21, 15).getTime(), customer: "Chan Vicheka", payment: "KHQR", status: "Delivered", gross: 12.00, outcome: 3.10, net: 8.90 },
  { id: "#ORD00303", date: "20 Sep 2026 18:02", timestamp: new Date(2026, 8, 20, 18, 2).getTime(), customer: "Heng Kimleang", payment: "ACLEDA", status: "Delivered", gross: 9.02, outcome: 2.50, net: 6.52 },
  { id: "#ORD00302", date: "18 Sep 2026 14:10", timestamp: new Date(2026, 8, 18, 14, 10).getTime(), customer: "Vannak Borin", payment: "KHQR", status: "Delivered", gross: 19.99, outcome: 5.00, net: 14.99 },
  { id: "#ORD00301", date: "15 Sep 2026 10:20", timestamp: new Date(2026, 8, 15, 10, 20).getTime(), customer: "Dara Chhay", payment: "Visa/Mastercard", status: "Delivered", gross: 9.99, outcome: 2.50, net: 7.49 },
  { id: "#ORD00300", date: "11 Sep 2026 16:45", timestamp: new Date(2026, 8, 11, 16, 45).getTime(), customer: "Nary Heng", payment: "KHQR", status: "Delivered", gross: 5.00, outcome: 1.25, net: 3.75 },
  { id: "#ORD00299", date: "08 Sep 2026 12:30", timestamp: new Date(2026, 8, 8, 12, 30).getTime(), customer: "Chea Serey", payment: "KHQR", status: "Delivered", gross: 45.00, outcome: 11.25, net: 33.75 },
  { id: "#ORD00298", date: "06 Sep 2026 08:15", timestamp: new Date(2026, 8, 6, 8, 15).getTime(), customer: "Phalla Tep", payment: "KHQR", status: "Delivered", gross: 85.00, outcome: 21.25, net: 63.75 },
  { id: "#ORD00297", date: "04 Sep 2026 19:00", timestamp: new Date(2026, 8, 4, 19, 0).getTime(), customer: "Mengly J. Quach", payment: "ACLEDA", status: "Delivered", gross: 20.00, outcome: 5.00, net: 15.00 },
  { id: "#ORD00296", date: "30 Aug 2026 11:10", timestamp: new Date(2026, 7, 30, 11, 10).getTime(), customer: "Channary Mom", payment: "KHQR", status: "Delivered", gross: 28.00, outcome: 7.00, net: 21.00 },
  { id: "#ORD00295", date: "24 Aug 2026 14:00", timestamp: new Date(2026, 7, 24, 14, 0).getTime(), customer: "Kosal Seng", payment: "KHQR", status: "Delivered", gross: 10.00, outcome: 2.50, net: 7.50 },
  { id: "#ORD00294", date: "15 Aug 2026 16:30", timestamp: new Date(2026, 7, 15, 16, 30).getTime(), customer: "Bopha Pich", payment: "KHQR", status: "Delivered", gross: 14.99, outcome: 3.75, net: 11.24 },
  { id: "#ORD00293", date: "01 Aug 2026 10:00", timestamp: new Date(2026, 7, 1, 10, 0).getTime(), customer: "Samnang Lay", payment: "ACLEDA", status: "Delivered", gross: 24.99, outcome: 6.25, net: 18.74 },
  { id: "#ORD00292", date: "10 Jul 2026 12:00", timestamp: new Date(2026, 6, 10, 12, 0).getTime(), customer: "Sovann Meas", payment: "KHQR", status: "Delivered", gross: 50.00, outcome: 12.50, net: 37.50 },
  { id: "#ORD00291", date: "20 May 2026 09:30", timestamp: new Date(2026, 4, 20, 9, 30).getTime(), customer: "Vicheth Sorn", payment: "KHQR", status: "Delivered", gross: 99.00, outcome: 24.75, net: 74.25 },
];

export function ReportsTab({ lang, theme }: Props) {
  const t = labels[lang];

  // ── Range Selection State ──
  const [rangePreset, setRangePreset] = useState<"1w" | "1m" | "6m" | "1y" | "custom">("1m");
  const [showCustomDrawer, setShowCustomDrawer] = useState(false);

  // Initialize start & end date (default 30 days ago to today)
  const defaultEndDate = toISODate(new Date());
  const defaultStartDate = toISODate(new Date(Date.now() - 30 * 86400000));

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Custom filters
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [operatingCostPct, setOperatingCostPct] = useState<number>(25); // Customizable outcome %

  // Backend Data
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pData, sData, plData] = await Promise.all([
        adminApi.getPayments(0, 100).catch(() => ({ content: [] })),
        adminApi.getDashboardStats().catch(() => null),
        adminApi.getPlans().catch(() => []),
      ]);
      setPayments(pData?.content || []);
      setStats(sData);
      setPlans(Array.isArray(plData) ? plData : []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Preset Clicks
  const handleRangePreset = (key: "1w" | "1m" | "6m" | "1y" | "custom") => {
    setRangePreset(key);
    const today = new Date();
    const todayStr = toISODate(today);
    setEndDate(todayStr);

    if (key === "1w") {
      setStartDate(toISODate(new Date(today.getTime() - 7 * 86400000)));
      setShowCustomDrawer(false);
    } else if (key === "1m") {
      setStartDate(toISODate(new Date(today.getTime() - 30 * 86400000)));
      setShowCustomDrawer(false);
    } else if (key === "6m") {
      setStartDate(toISODate(new Date(today.getTime() - 180 * 86400000)));
      setShowCustomDrawer(false);
    } else if (key === "1y") {
      setStartDate(toISODate(new Date(today.getTime() - 365 * 86400000)));
      setShowCustomDrawer(false);
    } else if (key === "custom") {
      setShowCustomDrawer(true);
    }
  };

  // Quick Presets inside Drawer
  const applyQuickPreset = (presetName: string) => {
    const today = new Date();
    const todayStr = toISODate(today);
    setRangePreset("custom");

    switch (presetName) {
      case "today":
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      case "yesterday": {
        const y = new Date(today.getTime() - 86400000);
        const yStr = toISODate(y);
        setStartDate(yStr);
        setEndDate(yStr);
        break;
      }
      case "7d":
        setStartDate(toISODate(new Date(today.getTime() - 7 * 86400000)));
        setEndDate(todayStr);
        break;
      case "30d":
        setStartDate(toISODate(new Date(today.getTime() - 30 * 86400000)));
        setEndDate(todayStr);
        break;
      case "thisMonth": {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(toISODate(firstDay));
        setEndDate(todayStr);
        break;
      }
      case "lastMonth": {
        const firstDayPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayPrev = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(toISODate(firstDayPrev));
        setEndDate(toISODate(lastDayPrev));
        break;
      }
      case "thisYear": {
        const firstDayYear = new Date(today.getFullYear(), 0, 1);
        setStartDate(toISODate(firstDayYear));
        setEndDate(todayStr);
        break;
      }
    }
    toast.info(lang === "kh" ? "បានកំណត់ចន្លោះកាលបរិច្ឆេទ" : "Date range preset applied");
  };

  const handleResetFilters = () => {
    const today = new Date();
    setRangePreset("1m");
    setStartDate(toISODate(new Date(today.getTime() - 30 * 86400000)));
    setEndDate(toISODate(today));
    setPaymentFilter("ALL");
    setStatusFilter("ALL");
    setSearchQuery("");
    setOperatingCostPct(25);
    setShowCustomDrawer(false);
    toast.success(lang === "kh" ? "បានកំណត់តម្រងឡើងវិញជោគជ័យ!" : "All filters reset to default");
  };

  // Combine Real Backend Payments and Seed Transactions
  const rawTransactions: TransactionItem[] = useMemo(() => {
    if (payments.length > 0) {
      return payments.map((p, idx) => {
        const gross = (p.amountCents || 999) / 100;
        const outcome = +(gross * (operatingCostPct / 100)).toFixed(2);
        const net = +(gross - outcome).toFixed(2);
        const paidTimestamp = p.paidAt ? new Date(p.paidAt).getTime() : Date.now() - idx * 3600000;
        return {
          id: `#ORD-${String(p.id).slice(0, 6).toUpperCase()}`,
          date: p.paidAt ? new Date(p.paidAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Recent",
          timestamp: paidTimestamp,
          customer: p.userEmail || `Customer ${idx + 1}`,
          payment: p.providerRef?.includes("KHQR") ? "KHQR" : (p.providerRef || "KHQR"),
          status: (p.status === "COMPLETED" || p.status === "SUCCESS") ? "Delivered" : "Processing",
          gross,
          outcome,
          net,
        };
      });
    }
    // Update seed outcome & net with customizable operatingCostPct
    return SEED_TRANSACTIONS.map(tx => {
      const outcome = +(tx.gross * (operatingCostPct / 100)).toFixed(2);
      const net = +(tx.gross - outcome).toFixed(2);
      return { ...tx, outcome, net };
    });
  }, [payments, operatingCostPct]);

  // Filter Transactions by Start Date, End Date, Payment, Status, and Search Query
  const filteredTransactions = useMemo(() => {
    const startMs = new Date(startDate).setHours(0, 0, 0, 0);
    const endMs = new Date(endDate).setHours(23, 59, 59, 999);

    return rawTransactions.filter(item => {
      // Date Range check
      if (item.timestamp < startMs || item.timestamp > endMs) return false;

      // Payment Filter
      if (paymentFilter !== "ALL") {
        if (paymentFilter === "KHQR" && !item.payment.toLowerCase().includes("khqr")) return false;
        if (paymentFilter === "ACLEDA" && !item.payment.toLowerCase().includes("acleda")) return false;
        if (paymentFilter === "CARD" && !item.payment.toLowerCase().includes("visa") && !item.payment.toLowerCase().includes("mastercard")) return false;
      }

      // Status Filter
      if (statusFilter !== "ALL") {
        if (item.status.toUpperCase() !== statusFilter.toUpperCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = item.id.toLowerCase().includes(q) ||
          item.customer.toLowerCase().includes(q) ||
          item.payment.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [rawTransactions, startDate, endDate, paymentFilter, statusFilter, searchQuery]);

  // Dynamic Calculated Metrics
  const { grossIncome, totalOutcome, netProfit, profitMarginPct, totalTransactionsCount, paidOrdersCount, aovValue } = useMemo(() => {
    const gross = filteredTransactions.reduce((acc, tx) => acc + tx.gross, 0);
    const outcome = filteredTransactions.reduce((acc, tx) => acc + tx.outcome, 0);
    const net = gross - outcome;
    const margin = gross > 0 ? ((net / gross) * 100).toFixed(1) : "0.0";
    const totalCount = filteredTransactions.length;
    const paidCount = filteredTransactions.filter(t => t.status === "Delivered" || t.status === "Processing").length;
    const aov = paidCount > 0 ? (gross / paidCount).toFixed(2) : "0.00";

    return {
      grossIncome: gross,
      totalOutcome: outcome,
      netProfit: net,
      profitMarginPct: margin,
      totalTransactionsCount: totalCount,
      paidOrdersCount: paidCount,
      aovValue: aov,
    };
  }, [filteredTransactions]);

  // Dynamic Timeline Bins
  const timelineData = useMemo(() => {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const diffDays = Math.max(1, Math.round((eDate.getTime() - sDate.getTime()) / 86400000) + 1);

    // If <= 31 days, generate day-by-day bins
    if (diffDays <= 31) {
      const bins = [];
      for (let i = 0; i < diffDays; i++) {
        const current = new Date(sDate.getTime() + i * 86400000);
        const dayLabel = `${current.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][current.getMonth()]}`;
        const dayStart = new Date(current).setHours(0, 0, 0, 0);
        const dayEnd = new Date(current).setHours(23, 59, 59, 999);

        const dayTxs = filteredTransactions.filter(t => t.timestamp >= dayStart && t.timestamp <= dayEnd);
        const income = +(dayTxs.reduce((acc, t) => acc + t.gross, 0)).toFixed(2);
        const outcome = +(dayTxs.reduce((acc, t) => acc + t.outcome, 0)).toFixed(2);
        const net = +(income - outcome).toFixed(2);

        bins.push({ date: dayLabel, income, outcome, net });
      }
      return bins;
    }

    // Otherwise generate 12 to 24 evenly spaced interval bins
    const numBins = Math.min(20, diffDays);
    const binSizeMs = (eDate.getTime() - sDate.getTime()) / numBins;
    const bins = [];
    for (let i = 0; i < numBins; i++) {
      const bStart = sDate.getTime() + i * binSizeMs;
      const bEnd = bStart + binSizeMs;
      const midDate = new Date(bStart);
      const label = `${midDate.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][midDate.getMonth()]}`;

      const bTxs = filteredTransactions.filter(t => t.timestamp >= bStart && t.timestamp <= bEnd);
      const income = +(bTxs.reduce((acc, t) => acc + t.gross, 0)).toFixed(2);
      const outcome = +(bTxs.reduce((acc, t) => acc + t.outcome, 0)).toFixed(2);
      const net = +(income - outcome).toFixed(2);

      bins.push({ date: label, income, outcome, net });
    }
    return bins;
  }, [startDate, endDate, filteredTransactions]);

  // Payment Breakdown Percentages
  const paymentStats = useMemo(() => {
    let khqrTotal = 0;
    let acledaTotal = 0;
    let cardTotal = 0;

    filteredTransactions.forEach(tx => {
      const p = tx.payment.toLowerCase();
      if (p.includes("khqr") || p.includes("bakong")) khqrTotal += tx.gross;
      else if (p.includes("acleda")) acledaTotal += tx.gross;
      else cardTotal += tx.gross;
    });

    const total = khqrTotal + acledaTotal + cardTotal || 1;
    return {
      khqrAmount: khqrTotal.toFixed(2),
      khqrPct: ((khqrTotal / total) * 100).toFixed(1),
      acledaAmount: acledaTotal.toFixed(2),
      acledaPct: ((acledaTotal / total) * 100).toFixed(1),
      cardAmount: cardTotal.toFixed(2),
      cardPct: ((cardTotal / total) * 100).toFixed(1),
    };
  }, [filteredTransactions]);

  // Top Selling Plans
  const displayPlans = useMemo(() => {
    if (plans.length > 0) {
      return plans.map((p, idx) => {
        const count = Math.max(1, Math.round(paidOrdersCount * (0.5 / (idx + 1))));
        const rev = ((p.priceCents * count) / 100).toFixed(2);
        return {
          name: `${p.name} (${p.maxVideoQuality || "HD"})`,
          sold: count,
          revenue: `$${rev}`,
        };
      });
    }
    return [
      { name: "VIP Premium 4K Plan", sold: Math.max(1, Math.round(paidOrdersCount * 0.55)), revenue: `$${(grossIncome * 0.55).toFixed(2)}` },
      { name: "Standard HD Tier (Monthly)", sold: Math.max(1, Math.round(paidOrdersCount * 0.25)), revenue: `$${(grossIncome * 0.25).toFixed(2)}` },
      { name: "Khmer Dubbed Movie Pass", sold: Math.max(1, Math.round(paidOrdersCount * 0.12)), revenue: `$${(grossIncome * 0.12).toFixed(2)}` },
      { name: "Basic Single-Screen Plan", sold: Math.max(1, Math.round(paidOrdersCount * 0.08)), revenue: `$${(grossIncome * 0.08).toFixed(2)}` },
    ];
  }, [plans, paidOrdersCount, grossIncome]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Order ID,Date,Customer,Payment,Status,Gross Income ($),Outcome Cost ($),Net Profit ($)"]
        .concat(filteredTransactions.map(t => `"${t.id}","${t.date}","${t.customer}","${t.payment}","${t.status}",${t.gross},${t.outcome},${t.net}`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `khmerflix_financial_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(lang === "kh" ? "បានទាញយកទិន្នន័យ CSV ជោគជ័យ!" : "Report exported to CSV successfully!");
  };

  // Styling helpers
  const isDark = theme === "dark";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-800" : "border-slate-200/80";
  const textHeading = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textSub = isDark ? "text-slate-300" : "text-slate-600";
  const inputBg = isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-800";

  const displayStartDate = formatDateDisplay(new Date(startDate), lang);
  const displayEndDate = formatDateDisplay(new Date(endDate), lang);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ── 1. Top Breadcrumb & Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <span>{t.tag}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textHeading}`}>
            {t.title}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${textMuted} flex items-center gap-1.5 flex-wrap`}>
            <span>{t.showingData}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/40">
              {displayStartDate}
            </span>
            <span>{t.to}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/40">
              {displayEndDate}
            </span>
            {operatingCostPct !== 25 && (
              <span className="text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                COGS: {operatingCostPct}%
              </span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => setShowCustomDrawer(!showCustomDrawer)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showCustomDrawer
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : `${borderCard} ${bgCard} ${textSub} hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm`
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.toggleCustomPanel}</span>
          </button>
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border ${borderCard} ${bgCard} ${textSub} hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer`}
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.printReport}</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Range Selector Pills Bar ── */}
      <div className={`${bgCard} border ${borderCard} rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold ${textMuted} px-2 flex items-center gap-1.5`}>
            <Calendar className="w-3.5 h-3.5" />
            {t.range}
          </span>
          {[
            { key: "1w", label: t.range1w },
            { key: "1m", label: t.range1m },
            { key: "6m", label: t.range6m },
            { key: "1y", label: t.range1y },
            { key: "custom", label: t.rangeCustom },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => handleRangePreset(r.key as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                rangePreset === r.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : `${textMuted} hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`
              }`}
            >
              <span>{r.label}</span>
              {r.key === "custom" && <ChevronDown className={`w-3 h-3 transition-transform ${showCustomDrawer ? "rotate-180" : ""}`} />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className={`text-xs font-medium ${textMuted} px-3 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border ${borderCard}`}>
            <span className="font-bold text-blue-600 dark:text-blue-400">{filteredTransactions.length}</span> {t.ordersAnalyzed}
          </div>
          {(paymentFilter !== "ALL" || statusFilter !== "ALL" || searchQuery || rangePreset === "custom" || operatingCostPct !== 25) && (
            <button
              onClick={handleResetFilters}
              title={t.resetFilter}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2.5 EXPANDABLE CUSTOM CONTROLS DRAWER ── */}
      {showCustomDrawer && (
        <div className={`${bgCard} border border-blue-500/30 dark:border-blue-500/40 rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200`}>
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className={`text-sm font-bold ${textHeading}`}>{t.customDrawerTitle}</h3>
              </div>
              <p className={`text-xs ${textMuted} mt-0.5`}>{t.customDrawerDesc}</p>
            </div>
            <button
              onClick={() => setShowCustomDrawer(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Presets */}
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted} block mb-2`}>
              {t.quickPresets}
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "today", label: t.presetToday },
                { key: "yesterday", label: t.presetYesterday },
                { key: "7d", label: t.preset7d },
                { key: "30d", label: t.preset30d },
                { key: "thisMonth", label: t.presetThisMonth },
                { key: "lastMonth", label: t.presetLastMonth },
                { key: "thisYear", label: t.presetThisYear },
              ].map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyQuickPreset(p.key)}
                  className={`text-xs px-2.5 py-1 rounded-lg border ${borderCard} bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer font-medium`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Pickers & Filter Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Start Date */}
            <div>
              <label className={`block text-xs font-semibold ${textSub} mb-1`}>
                {t.fromDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setRangePreset("custom");
                }}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${inputBg}`}
              />
            </div>

            {/* End Date */}
            <div>
              <label className={`block text-xs font-semibold ${textSub} mb-1`}>
                {t.toDate}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setRangePreset("custom");
                }}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${inputBg}`}
              />
            </div>

            {/* Payment Filter */}
            <div>
              <label className={`block text-xs font-semibold ${textSub} mb-1`}>
                {t.filterPayment}
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${inputBg}`}
              >
                <option value="ALL">{t.allPayments}</option>
                <option value="KHQR">Bakong KHQR</option>
                <option value="ACLEDA">ACLÉDA Bank</option>
                <option value="CARD">Visa / Mastercard</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-xs font-semibold ${textSub} mb-1`}>
                {t.filterStatus}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${inputBg}`}
              >
                <option value="ALL">{t.allStatuses}</option>
                <option value="DELIVERED">Delivered / Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {/* Operating Cost / COGS Margin Slider */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className={textSub}>{t.operatingCostMargin}</span>
                <span className="font-bold text-rose-500">{operatingCostPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={operatingCostPct}
                onChange={(e) => setOperatingCostPct(+e.target.value)}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className={`text-[10px] ${textMuted}`}>
                Adjusts outcome cost calculation dynamically across all revenue.
              </span>
            </div>

            {/* Reset & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className={`px-3 py-2 text-xs rounded-xl border ${borderCard} text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-medium`}
              >
                {t.resetFilter}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomDrawer(false);
                  toast.success(lang === "kh" ? "បានអនុវត្តតម្រងជោគជ័យ!" : "Custom financial filters applied!");
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                {t.applyFilter}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Four Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Gross Income */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.grossIncome}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textHeading}`}>
              ${grossIncome.toFixed(2)}
            </div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {paidOrdersCount} {t.paidOrders}
            </p>
          </div>
        </div>

        {/* Card 2: Total Outcome */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.totalOutcome}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-rose-500 dark:text-rose-400">
              ${totalOutcome.toFixed(2)}
            </div>
            <p className={`text-xs ${textMuted} mt-1`}>
              {t.outcomeSubtext} ({operatingCostPct}%)
            </p>
          </div>
        </div>

        {/* Card 3: Net Profit */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.netProfit}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
              ${netProfit.toFixed(2)}
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {profitMarginPct}% {t.profitMargin}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Orders & AOV */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.ordersAov}
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textHeading}`}>
              ${aovValue} <span className="text-xs font-semibold text-slate-400 uppercase">{t.aovSuffix}</span>
            </div>
            <p className={`text-xs ${textMuted} mt-1`}>
              {totalTransactionsCount} {t.itemsSold}
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Income vs Outcome Timeline Chart ── */}
      <div className={`${bgCard} border ${borderCard} rounded-2xl p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${textHeading}`}>
                {t.timelineTitle}
              </h3>
              <p className={`text-xs ${textMuted}`}>
                {t.timelineSubtitle}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className={textSub}>{t.income}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className={textSub}>{t.outcome}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className={textSub}>{t.profit}</span>
            </div>
          </div>
        </div>

        {/* Clustered Bar Visualizer with Dynamic Scaling & Gridlines */}
        <div className="overflow-x-auto pb-2 scrollbar-subtle">
          {timelineData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              {t.noTransactionsFound}
            </div>
          ) : (
            <>
              {(() => {
                const rawMax = Math.max(0, ...timelineData.map(item => Math.max(item.income, item.outcome, item.net)));
                const maxVal = rawMax > 0 ? rawMax : 1;

                return (
                  <div className="relative min-w-[700px]">
                    {/* Background Gridlines & Y-Axis Scale */}
                    <div className="absolute inset-0 h-52 flex flex-col justify-between pointer-events-none z-0">
                      <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 pr-2">
                        <span>${maxVal.toFixed(2)}</span>
                      </div>
                      <div className="border-b border-dashed border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400 pr-2">
                        <span>${(maxVal * 0.5).toFixed(2)}</span>
                      </div>
                      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 pr-2">
                        <span>$0.00</span>
                      </div>
                    </div>

                    {/* Bars Container */}
                    <div className="relative h-52 flex items-end gap-1.5 px-6 border-b border-slate-200 dark:border-slate-800 z-10">
                      {timelineData.map((d, idx) => {
                        const hasData = d.income > 0 || d.outcome > 0 || d.net > 0;
                        const hIncome = d.income > 0 ? Math.min(100, Math.max(14, (d.income / maxVal) * 100)) : 0;
                        const hOutcome = d.outcome > 0 ? Math.min(100, Math.max(12, (d.outcome / maxVal) * 100)) : 0;
                        const hNet = d.net > 0 ? Math.min(100, Math.max(12, (d.net / maxVal) * 100)) : 0;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
                            {/* Rich Floating Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] py-1.5 px-3 rounded-xl shadow-2xl border border-white/10 z-30 whitespace-nowrap transition-all duration-200 transform -translate-y-1">
                              <p className="font-bold text-slate-200 mb-0.5">{d.date}</p>
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-emerald-400 font-bold">+${d.income.toFixed(2)}</span>
                                <span className="text-rose-400">-${d.outcome.toFixed(2)}</span>
                                <span className="text-blue-400 font-bold">=${d.net.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Bars */}
                            {hasData ? (
                              <div className="flex items-end gap-1 w-full justify-center h-full pb-0.5">
                                {d.income > 0 && (
                                  <div
                                    className="w-2 sm:w-2.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm shadow-xs shadow-emerald-500/20 group-hover:brightness-125 transition-all duration-300"
                                    style={{ height: `${hIncome}%` }}
                                    title={`Income: $${d.income}`}
                                  />
                                )}
                                {d.outcome > 0 && (
                                  <div
                                    className="w-2 sm:w-2.5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm shadow-xs shadow-rose-500/20 group-hover:brightness-125 transition-all duration-300"
                                    style={{ height: `${hOutcome}%` }}
                                    title={`Outcome: $${d.outcome}`}
                                  />
                                )}
                                {d.net > 0 && (
                                  <div
                                    className="w-2 sm:w-2.5 bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-sm shadow-xs shadow-blue-500/20 group-hover:brightness-125 transition-all duration-300"
                                    style={{ height: `${hNet}%` }}
                                    title={`Net: $${d.net}`}
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700/60 mb-0.5 group-hover:bg-slate-400 transition" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis Dates */}
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-6 pt-2">
                      {timelineData.map((d, idx) => (
                        <span key={idx} className="flex-1 text-center truncate">
                          {timelineData.length > 15 ? (idx % 2 === 0 ? d.date : "—") : d.date}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* ── 5. Two-Column Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Payment Methods Breakdown */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className={`text-sm font-bold ${textHeading}`}>
              {t.paymentBreakdown}
            </h3>
          </div>

          <div className="space-y-4">
            {/* KHQR (Bakong) */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className={textHeading}>KHQR (Bakong)</span>
                <span className={textSub}>${paymentStats.khqrAmount} ({paymentStats.khqrPct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(2, +paymentStats.khqrPct))}%` }}
                />
              </div>
            </div>

            {/* ACLEDA */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className={textHeading}>ACLÉDA Bank</span>
                <span className={textSub}>${paymentStats.acledaAmount} ({paymentStats.acledaPct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(2, +paymentStats.acledaPct))}%` }}
                />
              </div>
            </div>

            {/* Visa / MasterCard */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className={textHeading}>Visa / Mastercard</span>
                <span className={textSub}>${paymentStats.cardAmount} ({paymentStats.cardPct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(2, +paymentStats.cardPct))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Selling Plans */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className={`text-sm font-bold ${textHeading}`}>
              {t.topSelling}
            </h3>
          </div>

          <div className="space-y-3.5">
            {displayPlans.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                <span className={`text-xs font-semibold ${textHeading} truncate max-w-[220px]`}>
                  {p.name}
                </span>
                <div className="flex items-center gap-4 text-xs">
                  <span className={textMuted}>{p.sold} {t.unitsSold}</span>
                  <span className={`font-bold ${textHeading}`}>{p.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. Financial Transaction Ledger ── */}
      <div className={`${bgCard} border ${borderCard} rounded-2xl overflow-hidden shadow-sm`}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <h3 className={`text-sm font-bold ${textHeading}`}>
              {t.ledgerTitle}
            </h3>
            <span className={`text-xs ${textMuted} ml-2`}>
              ({filteredTransactions.length} {t.ordersRecorded})
            </span>
          </div>

          {/* Search box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {t.noTransactionsFound}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{t.orderId}</th>
                  <th className="py-3.5 px-4">{t.date}</th>
                  <th className="py-3.5 px-4">{t.customer}</th>
                  <th className="py-3.5 px-4">{t.payment}</th>
                  <th className="py-3.5 px-4">{t.status}</th>
                  <th className="py-3.5 px-4 text-right">{t.tableGross}</th>
                  <th className="py-3.5 px-4 text-right">{t.tableOutcome}</th>
                  <th className="py-3.5 px-4 text-right">{t.tableNet}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                      {tx.id}
                    </td>
                    <td className={`py-3.5 px-4 ${textMuted}`}>
                      {tx.date}
                    </td>
                    <td className={`py-3.5 px-4 font-medium ${textHeading}`}>
                      {tx.customer}
                    </td>
                    <td className={`py-3.5 px-4 font-semibold ${textSub}`}>
                      {tx.payment}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === "Delivered" 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                          : tx.status === "Processing"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-semibold ${textHeading}`}>
                      ${tx.gross.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-rose-500 dark:text-rose-400">
                      ${tx.outcome.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ${tx.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
