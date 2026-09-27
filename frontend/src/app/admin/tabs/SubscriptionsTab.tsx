"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CreditCard, Users, Plus, Edit2, Trash2, RefreshCw, X, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/src/lib/api/endpoints";
import type { SubscriptionPlanResponse, SubscriptionResponse, PaymentResponse } from "@/src/types/movie";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
}

const labels = {
  en: {
    plans: "Subscription Plans", userSubs: "User Subscriptions", payments: "Payments",
    createPlan: "Create Plan", editPlan: "Edit Plan",
    name: "Plan Name", price: "Price (USD)", quality: "Max Video Quality", streams: "Max Streams",
    save: "Save", cancel: "Cancel",
    user: "User", plan: "Plan", status: "Status", started: "Started", expires: "Expires", actions: "Actions",
    orderId: "Order ID", date: "Date", customer: "Customer", amount: "Amount", payStatus: "Status",
    cancelSub: "Cancel Subscription", confirmCancel: "Cancel this user's subscription?",
    confirmDelete: "Delete this plan? This may break existing subscriptions.",
    noPlans: "No subscription plans configured. Create one to get started.",
    noSubs: "No user subscriptions found.",
    noPayments: "No payment records found.",
    active: "Active", cancelled: "Cancelled", expired: "Expired", pending: "Pending",
    priceCents: "Price (in cents, e.g. 999 = $9.99)",
  },
  kh: {
    plans: "កញ្ចប់ជាវ", userSubs: "ការជាវរបស់អ្នកប្រើ", payments: "ការទូទាត់",
    createPlan: "បង្កើតកញ្ចប់", editPlan: "កែប្រែកញ្ចប់",
    name: "ឈ្មោះកញ្ចប់", price: "តម្លៃ (ដុល្លារ)", quality: "គុណភាពវីដេអូអតិបរមា", streams: "ស្ទ្រីម​ច្រើន​ជាង​គេ",
    save: "រក្សាទុក", cancel: "បោះបង់",
    user: "អ្នកប្រើ", plan: "កញ្ចប់", status: "ស្ថានភាព", started: "ចាប់ផ្ដើម", expires: "ផុតកំណត់", actions: "សកម្មភាព",
    orderId: "លេខកម្មង់", date: "កាលបរិច្ឆេទ", customer: "អតិថិជន", amount: "ចំនួន​ប្រាក់", payStatus: "ស្ថានភាព",
    cancelSub: "លុបចោលការជាវ", confirmCancel: "លុបចោលការជាវអ្នកប្រើនេះ?",
    confirmDelete: "លុបចោលកញ្ចប់នេះ? នឹងប៉ះពាល់ដល់ការជាវដែលកំពុងដំណើរការ។",
    noPlans: "មិនទាន់មានកញ្ចប់ជាវទេ។ បង្កើតមួយដើម្បីចាប់ផ្ដើម។",
    noSubs: "រក​មិន​ឃើញ​ការ​ជាវ​របស់​អ្នក​ប្រើ​ប្រាស់​ណា​ទេ។",
    noPayments: "រក​មិន​ឃើញ​កំណត់​ហេតុ​ការ​ទូ​ទាត់​ណា​ទេ។",
    active: "សកម្ម", cancelled: "បានលុបចោល", expired: "ផុតកំណត់", pending: "កំពុងរង់ចាំ",
    priceCents: "តម្លៃ (ជា cents, ឧ. 999 = $9.99)",
  },
};

type SubView = "plans" | "subs" | "payments";

export function SubscriptionsTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [view, setView] = useState<SubView>("plans");
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [subs, setSubs] = useState<SubscriptionResponse[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [planForm, setPlanForm] = useState<Partial<SubscriptionPlanResponse & { priceCents: number }>>({});

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }, []);

  const loadSubs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSubscriptions(0, 100);
      setSubs(data.content || []);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }, []);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPayments(0, 100);
      setPayments(data.content || []);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (view === "plans") loadPlans();
    else if (view === "subs") loadSubs();
    else loadPayments();
  }, [view, loadPlans, loadSubs, loadPayments]);

  const openCreate = () => { setPlanForm({}); setModalOpen(true); };
  const openEdit = (p: SubscriptionPlanResponse) => {
    setPlanForm({ ...p });
    setModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: planForm.name!,
        priceCents: Number(planForm.priceCents),
        maxVideoQuality: planForm.maxVideoQuality || "HD",
        maxConcurrentStreams: Number(planForm.maxConcurrentStreams) || 1,
      };
      if ((planForm as any).id) {
        await adminApi.updatePlan((planForm as any).id, payload);
        toast.success("Plan updated");
      } else {
        await adminApi.createPlan(payload);
        toast.success("Plan created");
      }
      setModalOpen(false);
      loadPlans();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await adminApi.deletePlan(id);
      toast.success(lang === "kh" ? "បានលុបកញ្ចប់ជាវជោគជ័យ" : "Plan deleted successfully");
      loadPlans();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete plan");
    }
  };

  const handleCancelSub = async (id: string) => {
    if (!confirm(t.confirmCancel)) return;
    try {
      await adminApi.cancelSubscription(id);
      toast.success("Subscription cancelled");
      loadSubs();
    } catch (e: any) { toast.error(e.message); }
  };

  const statusColor = (s: string) => {
    const lower = (s || "").toLowerCase();
    if (lower === "active") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (lower === "cancelled") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (lower === "expired") return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className={`flex items-center gap-1 ${bg} rounded-xl p-1 w-fit border ${border}`}>
        {([["plans", t.plans, <CreditCard className="w-4 h-4" key="c" />], ["subs", t.userSubs, <Users className="w-4 h-4" key="u" />]] as const).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setView(key as SubView)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${view === key ? "bg-indigo-600 text-white shadow-sm" : `${textM} hover:bg-gray-100 dark:hover:bg-slate-800`}`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Plans View */}
      {view === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={loadPlans} className={`p-2 rounded-lg ${textM} hover:text-indigo-600 cursor-pointer transition`}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition">
              <Plus className="w-4 h-4" /> {t.createPlan}
            </button>
          </div>

          {/* Plan Cards */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : plans.length === 0 ? (
            <div className={`${bg} rounded-xl p-12 text-center border ${border}`}>
              <CreditCard className={`w-12 h-12 ${textM} mx-auto mb-3`} />
              <p className={`text-sm ${textM}`}>{t.noPlans}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((p, i) => {
                const colors = [
                  { accent: "border-t-4 border-indigo-500", badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" },
                  { accent: "border-t-4 border-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
                  { accent: "border-t-4 border-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
                ][i % 3];
                const priceUSD = ((p.priceCents || 0) / 100).toFixed(2);
                return (
                  <div key={p.id} className={`${bg} rounded-xl border ${border} ${colors.accent} p-6 shadow-sm hover:shadow-md transition`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className={`text-lg font-bold ${textH}`}>{p.name}</h4>
                        <div className={`text-2xl font-black mt-1 ${textH}`}>\${priceUSD}<span className={`text-sm font-normal ${textM}`}>/mo</span></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className={`${textM} hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 p-1.5 rounded cursor-pointer transition`} title={t.editPlan}><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeletePlan(p.id)} className={`${textM} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded cursor-pointer transition`} title={t.confirmDelete}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className={textM}>{t.quality}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors.badge}`}>{p.maxVideoQuality || "HD"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={textM}>{t.streams}</span>
                        <span className={`font-semibold ${textH}`}>{p.maxConcurrentStreams || 1}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openEdit(p)}
                      className="mt-5 w-full py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition text-sm font-semibold cursor-pointer"
                    >
                      {t.editPlan}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* User Subscriptions View */}
      {view === "subs" && (
        <div className={`${bg} rounded-xl overflow-hidden`}>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4">{t.user}</th>
                <th className="py-4 px-4">{t.plan}</th>
                <th className="py-4 px-4">{t.status}</th>
                <th className="py-4 px-4">{t.started}</th>
                <th className="py-4 px-4">{t.expires}</th>
                <th className="py-4 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : subs.length === 0 ? (
                <tr><td colSpan={6} className={`py-12 text-center text-sm ${textM}`}>{t.noSubs}</td></tr>
              ) : subs.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className={`py-4 px-4 font-medium ${textH}`}>{s.userId || "—"}</td>
                  <td className={`py-4 px-4 ${textM}`}>{s.plan?.name || "—"}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor(s.status)}`}>{s.status}</span>
                  </td>
                  <td className={`py-4 px-4 text-xs ${textM}`}>{s.startedAt ? new Date(s.startedAt).toLocaleDateString() : "—"}</td>
                  <td className={`py-4 px-4 text-xs ${textM}`}>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : "—"}</td>
                  <td className="py-4 px-4 text-right">
                    {s.status?.toLowerCase() === "active" && (
                      <button onClick={() => handleCancelSub(s.id)} title={t.cancelSub} className={`${textM} hover:text-red-500 p-1.5 rounded cursor-pointer`}><XCircle className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${bg} rounded-2xl shadow-2xl w-full max-w-md border ${border} overflow-hidden`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
              <h3 className={`text-base font-bold ${textH}`}>{(planForm as any).id ? t.editPlan : t.createPlan}</h3>
              <button onClick={() => setModalOpen(false)} className={`${textM} hover:text-red-500 cursor-pointer`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.name} *</label>
                <input required value={planForm.name || ""} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Premium" />
              </div>
              <div>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.priceCents}</label>
                <input required type="number" min="0" value={planForm.priceCents || ""} onChange={e => setPlanForm(f => ({ ...f, priceCents: Number(e.target.value) }))} className={inputCls} placeholder="999" />
                {planForm.priceCents ? <p className={`text-xs ${textM} mt-1`}>= \${(Number(planForm.priceCents) / 100).toFixed(2)} / month</p> : null}
              </div>
              <div>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.quality}</label>
                <select value={planForm.maxVideoQuality || "HD"} onChange={e => setPlanForm(f => ({ ...f, maxVideoQuality: e.target.value }))} className={inputCls}>
                  <option value="SD">SD (480p)</option>
                  <option value="HD">HD (1080p)</option>
                  <option value="4K">4K Ultra HD</option>
                  <option value="4K HDR">4K HDR</option>
                </select>
              </div>
              <div>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.streams}</label>
                <select value={planForm.maxConcurrentStreams || 1} onChange={e => setPlanForm(f => ({ ...f, maxConcurrentStreams: Number(e.target.value) }))} className={inputCls}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n > 1 ? "screens" : "screen"}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition">{t.save}</button>
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 border ${border} ${textM} py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition`}>{t.cancel}</button>
              </div>
              {(planForm as any).id && (
                <button
                  type="button"
                  onClick={() => {
                    handleDeletePlan((planForm as any).id);
                    setModalOpen(false);
                  }}
                  className="w-full border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 py-2 rounded-lg font-semibold text-xs cursor-pointer transition flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === "kh" ? "លុបកញ្ចប់ជាវនេះ" : "Delete This Plan"}</span>
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
