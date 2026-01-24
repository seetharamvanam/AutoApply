import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BriefcaseIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'; // v2 imports
import axios from 'axios';

// Mock data for initial render or if API fails
const mockData = [
    { name: 'Jan', applied: 4 },
    { name: 'Feb', applied: 8 },
    { name: 'Mar', applied: 15 },
    { name: 'Apr', applied: 10 },
    { name: 'May', applied: 20 },
    { name: 'Jun', applied: 18 },
];

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface backdrop-blur-md border border-surfaceHighlight rounded-xl p-6 flex items-center justify-between"
    >
        <div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-20 ${color}`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalApplied: 0,
        totalInterviews: 0,
        totalOffers: 0,
        totalRejected: 0
    });

    useEffect(() => {
        // Fetch stats from API
        // axios.get('/api/jobs/stats').then(res => setStats(res.data));
        // Using mock for now to show UI immediately
        setStats({
            totalApplied: 42,
            totalInterviews: 5,
            totalOffers: 1,
            totalRejected: 12
        });
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Applied" value={stats.totalApplied} icon={BriefcaseIcon} color="bg-primary text-primary" />
                <StatCard title="Interviews" value={stats.totalInterviews} icon={CalendarIcon} color="bg-blue-500 text-blue-500" />
                <StatCard title="Offers" value={stats.totalOffers} icon={CheckCircleIcon} color="bg-success text-success" />
                <StatCard title="Rejected" value={stats.totalRejected} icon={XCircleIcon} color="bg-error text-error" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-surface backdrop-blur-md border border-surfaceHighlight rounded-xl p-6"
                >
                    <h2 className="text-xl font-bold mb-6">Application Trends</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockData}>
                                <defs>
                                    <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false} />
                                <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="applied" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorApplied)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-surface backdrop-blur-md border border-surfaceHighlight rounded-xl p-6"
                >
                    <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center">
                                    <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium">Software Engineer</h4>
                                    <p className="text-sm text-gray-400">Google • 2 days ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
