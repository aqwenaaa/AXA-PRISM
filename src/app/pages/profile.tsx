"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { ArrowLeft, User, Mail, Phone, Building2, Shield, Edit, Camera, Save, Bell, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">User Profile</h1>
                <p className="text-sm text-muted-foreground">Manage your account information and settings</p>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              className={isEditing ? "bg-primary text-white" : ""}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="glass rounded-2xl p-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-4xl font-semibold shadow-lg shadow-primary/20">
                  JD
                </div>
                {isEditing && (
                  <motion.button
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                )}
              </div>

              <h2 className="text-2xl font-semibold text-foreground mb-2">John Doe</h2>
              <p className="text-sm text-muted-foreground mb-1">Strategic Manager</p>
              <p className="text-xs text-muted-foreground mb-6">Member since Jan 2024</p>

              <div className="flex flex-col gap-3">
                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Role</div>
                  <div className="text-sm font-medium text-foreground">Administrator</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Department</div>
                  <div className="text-sm font-medium text-foreground">Risk Management</div>
                </div>
                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Access Level</div>
                  <div className="text-sm font-medium text-primary">Full Access</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Personal Information */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  <input
                    type="text"
                    defaultValue="John"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isEditing
                        ? 'border-primary/30 bg-white'
                        : 'border-border bg-muted/30'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isEditing
                        ? 'border-primary/30 bg-white'
                        : 'border-border bg-muted/30'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      defaultValue="john.doe@axaprism.com"
                      disabled={!isEditing}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                        isEditing
                          ? 'border-primary/30 bg-white'
                          : 'border-border bg-muted/30'
                      } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      disabled={!isEditing}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                        isEditing
                          ? 'border-primary/30 bg-white'
                          : 'border-border bg-muted/30'
                      } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Company Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <input
                    type="text"
                    defaultValue="AXA Global Healthcare"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isEditing
                        ? 'border-primary/30 bg-white'
                        : 'border-border bg-muted/30'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                  <input
                    type="text"
                    defaultValue="Strategic Manager"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isEditing
                        ? 'border-primary/30 bg-white'
                        : 'border-border bg-muted/30'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Office Location</label>
                  <input
                    type="text"
                    defaultValue="New York, NY - USA"
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isEditing
                        ? 'border-primary/30 bg-white'
                        : 'border-border bg-muted/30'
                    } text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Preferences & Settings
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Email Notifications</div>
                      <div className="text-xs text-muted-foreground">Receive updates about claims and alerts</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground">Enhanced security for your account</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <Link href="/change-password">
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Change Password</div>
                        <div className="text-xs text-muted-foreground">Update your login credentials</div>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="glass rounded-2xl p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-1">
                    142
                  </div>
                  <div className="text-sm text-muted-foreground">Claims Reviewed</div>
                  <div className="text-xs text-primary mt-1">This Month</div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-1">
                    28
                  </div>
                  <div className="text-sm text-muted-foreground">Anomalies Detected</div>
                  <div className="text-xs text-primary mt-1">This Week</div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-1">
                    45h
                  </div>
                  <div className="text-sm text-muted-foreground">Total Session Time</div>
                  <div className="text-xs text-primary mt-1">This Month</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
