/**
 * System Overview Page (Admin Only)
 *
 * Dashboard showing system health, user activity, and quick access to all modules
 */
"use client";
import { motion } from "motion/react";
import {
  Shield,
  Users,
  Activity,
  Database,
  Brain,
  Stethoscope,
  TrendingUp,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export default function SystemOverviewPage() {
  return (
    <div className="h-full bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
              <p className="text-sm text-muted-foreground">
                God Mode Navigation — Full system visibility and control
              </p>
            </div>
          </div>
        </motion.div>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="bg-white rounded-xl p-5 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <Badge className="bg-success/10 text-success border-success/30">
                Online
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">System Status</p>
            <p className="text-2xl font-bold text-foreground">Healthy</p>
            <p className="text-xs text-muted-foreground mt-2">
              All services operational
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-5 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/30">
                +2 today
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Active Users</p>
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-xs text-muted-foreground mt-2">
              Last login: 2 minutes ago
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-5 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/30">
                98.2%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Data Quality</p>
            <p className="text-2xl font-bold text-foreground">Excellent</p>
            <p className="text-xs text-muted-foreground mt-2">
              Last validation: 1 hour ago
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-5 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <Badge className="bg-purple-600/10 text-purple-600 border-purple-600/30">
                v2.4.3
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">AI Engine</p>
            <p className="text-2xl font-bold text-foreground">Active</p>
            <p className="text-xs text-muted-foreground mt-2">
              99.9% accuracy rate
            </p>
          </motion.div>
        </div>

        {/* Quick Access Modules */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Omnipresent View — All Modules
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            As Admin, you have access to all system modules. Click any module to inspect it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Management */}
            <Link href="/user-management">
              <motion.div
                className="bg-white rounded-xl p-6 border border-border hover:border-gray-900 hover:shadow-lg transition-all group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-gray-900/10 text-gray-900 border-gray-900/30">
                    Admin Only
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage user roles, permissions, and access control
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>5 Active Users</span>
                </div>
              </motion.div>
            </Link>

            {/* Data Ingestion */}
            <Link href="/data-ingestion">
              <motion.div
                className="bg-white rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    Operator
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Data Ingestion</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload and validate medical data pipelines
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>12 Jobs Today</span>
                </div>
              </motion.div>
            </Link>

            {/* Intelligence Lab */}
            <Link href="/intelligence-lab">
              <motion.div
                className="bg-white rounded-xl p-6 border border-border hover:border-blue-600 hover:shadow-lg transition-all group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-primary flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/30">
                    Analyst
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Intelligence Lab</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  AI-powered anomaly detection and clustering
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <span>8 Anomalies Detected</span>
                </div>
              </motion.div>
            </Link>

            {/* Medical Audit */}
            <Link href="/medical-audit">
              <motion.div
                className="bg-white rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    Auditor
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Medical Audit</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Human-in-the-loop claim verification workflow
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>15 Pending Reviews</span>
                </div>
              </motion.div>
            </Link>

            {/* Executive Dashboard */}
            <Link href="/executive-dashboard">
              <motion.div
                className="bg-white rounded-xl p-6 border border-border hover:border-indigo-700 hover:shadow-lg transition-all group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 to-primary flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-indigo-700/10 text-indigo-700 border-indigo-700/30">
                    Manager
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Executive Command</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Strategic insights and financial forecasting
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>$2.4M Potential Savings</span>
                </div>
              </motion.div>
            </Link>

            {/* Claim Growth */}
            <Link href="/claim-growth">
              <motion.div
                className="bg-white rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg transition-all group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    All Roles
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Claim Growth</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive claim trend analysis dashboard
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>+18% This Quarter</span>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="bg-white rounded-xl p-6 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent System Activity</h2>
          <div className="space-y-4">
            {[
              {
                user: "Dr. Sari Dewi",
                action: "detected 3 new anomalies",
                module: "Intelligence Lab",
                time: "5 minutes ago",
                icon: Brain,
                color: "blue-600",
              },
              {
                user: "Ahmad Fauzi",
                action: "uploaded policy dataset",
                module: "Data Ingestion",
                time: "12 minutes ago",
                icon: Upload,
                color: "primary",
              },
              {
                user: "Dr. Budi Santoso",
                action: "completed 2 claim audits",
                module: "Medical Audit",
                time: "1 hour ago",
                icon: Stethoscope,
                color: "primary",
              },
              {
                user: "Ir. Dian Pratiwi",
                action: "approved strategic policy",
                module: "Executive Command",
                time: "2 hours ago",
                icon: TrendingUp,
                color: "indigo-700",
              },
            ].map((activity, i) => {
              const Icon = activity.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className={`w-10 h-10 rounded-lg bg-${activity.color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 text-${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.module} • {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}