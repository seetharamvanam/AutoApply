import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LinkIcon, PencilSquareIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobEntry = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('link'); // 'link' | 'manual'
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        url: '',
        description: '',
        status: 'SAVED',
        sourceType: 'MANUAL',
        notes: ''
    });

    const handleParse = async () => {
        if (!url) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/jobs/parse', url, {
                headers: { 'Content-Type': 'text/plain' }
            });
            setFormData({
                ...res.data,
                sourceType: 'LINK',
                status: 'SAVED',
                notes: ''
            });
            setMode('manual'); // Switch to review mode
        } catch (err) {
            console.error(err);
            alert('Failed to parse link. Please enter details manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/jobs', formData);
            navigate('/');
        } catch (err) {
            alert('Failed to save job');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Add New Job</h1>

            {/* Tabs */}
            <div className="flex bg-surface border border-surfaceHighlight rounded-lg p-1">
                <button
                    onClick={() => setMode('link')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${mode === 'link' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <LinkIcon className="w-5 h-5" />
                    <span>Auto-Fill from Link</span>
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${mode === 'manual' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <PencilSquareIcon className="w-5 h-5" />
                    <span>Manual Entry</span>
                </button>
            </div>

            {/* Content */}
            <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-surface backdrop-blur-md border border-surfaceHighlight rounded-xl p-6"
            >
                {mode === 'link' ? (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-400">Job Link</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="https://linkedin.com/jobs/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 bg-background/50 border border-surfaceHighlight rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                onClick={handleParse}
                                disabled={loading}
                                className="bg-primary hover:bg-primary-hover px-6 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                                Analyze
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">
                            We'll extract the title, company, and description automatically.
                            You can review before saving.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full bg-background/50 border border-surfaceHighlight rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-background/50 border border-surfaceHighlight rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-background/50 border border-surfaceHighlight rounded-lg px-4 py-2 focus:border-primary focus:outline-none appearance-none"
                            >
                                <option value="SAVED">Saved</option>
                                <option value="APPLIED">Applied</option>
                                <option value="INTERVIEW">Interviewing</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-background/50 border border-surfaceHighlight rounded-lg px-4 py-2 focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="bg-success hover:bg-emerald-600 text-white px-8 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                Save Job
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default JobEntry;
