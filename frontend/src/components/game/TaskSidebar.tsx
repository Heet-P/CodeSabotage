'use client';

import { Task } from '@/types';
import { useState } from 'react';

interface TaskSidebarProps {
    tasks: Task[];
    onRunTask: (taskId: string) => void;
}

export default function TaskSidebar({ tasks, onRunTask }: TaskSidebarProps) {
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    const toggleTask = (taskId: string) => {
        if (expandedTask === taskId) {
            setExpandedTask(null);
        } else {
            setExpandedTask(taskId);
        }
    };

    return (
        <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 h-full flex flex-col">
            <h2 className="text-sm font-bold text-gray-400 mb-4 tracking-wider flex justify-between items-center">
                MY TASKS
                <span className="text-white">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </h2>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`border rounded-lg transition-all duration-200 ${task.completed
                            ? 'bg-green-500/10 border-green-500/30'
                            : expandedTask === task.id
                                ? 'bg-gray-800 border-blue-500/50'
                                : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                            }`}
                    >
                        <div
                            className="p-3 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleTask(task.id)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`
                  w-2 h-2 rounded-full shrink-0
                  ${task.completed ? 'bg-green-500' : 'bg-blue-500'}
                `} />
                                <span className={`font-medium text-sm truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                    {task.title}
                                </span>
                            </div>
                            <div className={`text-xs px-2 py-0.5 rounded border ${task.difficulty === 'easy' ? 'border-green-500/30 text-green-400' :
                                task.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                                    'border-red-500/30 text-red-400'
                                }`}>
                                {task.difficulty.toUpperCase()}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedTask === task.id && !task.completed && (
                            <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2 duration-200">
                                <div className="border-t border-gray-700/50 my-2"></div>
                                <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                                    {task.description}
                                </p>
                                {task.codeSnippet && (
                                    <div className="bg-black/30 p-2 rounded border border-white/5 font-mono text-[10px] text-gray-300 mb-3 overflow-x-auto">
                                        {task.codeSnippet}
                                    </div>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRunTask(task.id);
                                    }}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    VERIFY SOLUTION
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
