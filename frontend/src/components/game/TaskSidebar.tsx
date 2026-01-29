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
        <div className="flex flex-col h-full">
            <h2 className="font-pixel text-sm text-[#2C3A47] mb-4 border-b-4 border-[#2C3A47] pb-2 flex justify-between">
                TASKS
                <span className="text-[#F0932B]">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </h2>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`border-4 transition-all duration-200 ${task.completed
                            ? 'bg-[#44BD32]/20 border-[#44BD32] opacity-70'
                            : expandedTask === task.id
                                ? 'bg-white border-[#F0932B] shadow-[4px_4px_0_rgba(0,0,0,0.1)]'
                                : 'bg-white border-[#84817a] hover:border-[#2C3A47]'
                            }`}
                    >
                        <div
                            className="p-3 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleTask(task.id)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`
                  w-3 h-3 border-2 border-black
                  ${task.completed ? 'bg-[#44BD32]' : 'bg-[#d1ccc0]'}
                `} />
                                <span className={`font-pixel text-[10px] truncate ${task.completed ? 'text-[#2C3A47] line-through' : 'text-[#2C3A47]'}`}>
                                    {task.title}
                                </span>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedTask === task.id && !task.completed && (
                            <div className="px-3 pb-3 pt-0">
                                <div className="border-t-2 border-[#84817a] my-2 border-dashed"></div>
                                <p className="font-mono text-[10px] text-[#2C3A47] mb-2 leading-tight">
                                    {task.description}
                                </p>
                                {task.codeSnippet && (
                                    <div className="bg-[#1e272e] p-2 border-2 border-[#2C3A47] font-mono text-[10px] text-white mb-2 overflow-x-auto">
                                        {task.codeSnippet}
                                    </div>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRunTask(task.id);
                                    }}
                                    className="w-full py-2 bg-[#4834d4] hover:bg-[#686de0] text-white text-[10px] font-pixel border-4 border-[#30336b] shadow-[2px_2px_0_#130f40] active:shadow-none active:translate-y-0.5 transition-all text-center"
                                >
                                    VERIFY
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
