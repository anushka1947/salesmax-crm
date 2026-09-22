"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Search,
  CheckCircle2,
  Phone,
  UserCheck,
} from "lucide-react";
import QuickAddModal from "./QuickAddModal";

interface TopbarProps {
  onRefresh?: () => void;
}

export default function Topbar({ onRefresh }: TopbarProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Search Bar */}
        <div className="flex items-center gap-3 w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads, deals, contacts..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800">
                    Notifications
                  </h4>
                  <span className="text-[10px] text-purple-600 font-semibold cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="divide-y divide-slate-50 text-xs py-1">
                  <div className="py-2 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">
                        Task completed
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Call follow-up was marked done
                      </p>
                    </div>
                  </div>
                  <div className="py-2 flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-medium">New Lead Captured</p>
                      <p className="text-slate-400 text-[11px]">
                        From Facebook Ads campaign
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AS
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                Alex Sharma
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight">
                Sales Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSuccess={() => {
            setIsQuickAddOpen(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
