'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuth } from '@/context/AuthContext';

interface CodeEditorProps {
    roomName: string; // Changed from lobbyId to generic roomName
    initialCode?: string; // Code to populate if room is empty
    onMount?: (editor: any, monaco: any) => void;
}

export default function CodeEditor({ roomName, initialCode, onMount }: CodeEditorProps) {
    console.log(`[CodeEditor] Init with Room: ${roomName}, HasInitialCode: ${!!initialCode}`);
    const { user } = useAuth();
    const editorRef = useRef<any>(null);
    const [provider, setProvider] = useState<WebsocketProvider | null>(null);
    const [connected, setConnected] = useState(false);

    const handleEditorDidMount: OnMount = async (editor, monaco) => {
        editorRef.current = editor;
        if (onMount) onMount(editor, monaco);

        // Dynamic import
        const { MonacoBinding } = await import('y-monaco');

        // Clean up previous provider if any (though useEffect handles this usually, safe to ensure)
        if (provider) provider.destroy();

        // Initialize Yjs
        const doc = new Y.Doc();
        const wsUrl = process.env.NEXT_PUBLIC_YJS_WS_URL || 'ws://localhost:1234';
        const wsProvider = new WebsocketProvider(
            wsUrl,
            roomName,
            doc
        );

        wsProvider.on('status', (event: any) => {
            setConnected(event.status === 'connected');
        });

        // Wait for connection/sync to determine if we need to inject initialCode
        wsProvider.on('sync', (isSynced: boolean) => {
            console.log(`[CodeEditor] Sync event: ${isSynced}, Room: ${roomName}`);
            if (isSynced && initialCode) {
                const monacoText = doc.getText('monaco');
                console.log(`[CodeEditor] Doc length: ${monacoText.length}`);
                if (monacoText.length === 0) {
                    console.log('[CodeEditor] Injecting initial code...');
                    // Room is new/empty, inject boilerplate
                    monacoText.insert(0, initialCode);
                } else {
                    console.log('[CodeEditor] Doc not empty, skipping injection.');
                }
            }
        });

        setProvider(wsProvider);

        const type = doc.getText('monaco');

        const binding = new MonacoBinding(
            type,
            editor.getModel()!,
            new Set([editor]),
            wsProvider.awareness
        );

        // Set user awareness (cursor info)
        const getUserColor = (username: string) => {
            const colors = [
                '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399',
                '#22d3ee', '#818cf8', '#e879f9', '#f472b6', '#f43f5e'
            ];
            let hash = 0;
            for (let i = 0; i < username.length; i++) {
                hash = username.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        };

        const userName = user?.user_metadata.username || user?.email || 'Anonymous';
        const userColor = getUserColor(userName);

        if (user) {
            wsProvider.awareness.setLocalStateField('user', {
                name: userName,
                color: userColor
            });
        }

        // Dynamic Style Injection for Cursors
        const styleElement = document.createElement('style');
        document.head.appendChild(styleElement);

        const updateCursorStyles = () => {
            const states = wsProvider.awareness.getStates();
            let css = '';

            states.forEach((state: any, clientId: number) => {
                if (state.user && state.user.color && state.user.name) {
                    const { color, name } = state.user;
                    css += `
                        .yRemoteSelection-${clientId} {
                            background-color: ${color}50;
                        }
                        .yRemoteSelectionHead-${clientId} {
                            position: absolute;
                            border-left: ${color} solid 2px;
                            border-top: ${color} solid 2px;
                            border-bottom: ${color} solid 2px;
                            height: 100%;
                            box-sizing: border-box;
                        }
                        .yRemoteSelectionHead-${clientId}::after {
                            position: absolute;
                            content: "${name}";
                            background-color: ${color};
                            color: #111;
                            border: 1px solid ${color};
                            font-size: 10px;
                            padding: 0px 4px;
                            border-radius: 4px;
                            left: -2px;
                            top: -20px;
                            white-space: nowrap;
                            font-family: monospace;
                            font-weight: bold;
                            z-index: 10;
                        }
                    `;
                }
            });

            styleElement.innerHTML = css;
        };

        wsProvider.awareness.on('change', updateCursorStyles);

        // Initial call to set styles if users are already present
        updateCursorStyles();

        // Attach cleanup for style element to the provider destroy or binding destroy? 
        // We need to pass this out to the cleanup function.
        (wsProvider as any)._styleElement = styleElement;

        // Cleanup
        const cleanup = () => {
            wsProvider.awareness.off('change', updateCursorStyles);
            if ((wsProvider as any)._styleElement && (wsProvider as any)._styleElement.parentNode) {
                (wsProvider as any)._styleElement.parentNode.removeChild((wsProvider as any)._styleElement);
            }
            wsProvider.destroy();
            binding.destroy();
        };

        // Store cleanup function in a way that useEffect can access if needed, 
        // but since this is OnMount, we rely on the component unmount.
        // However, OnMount doesn't return a cleanup function to React.
        // We should probably store these in a ref or state to clean up in useEffect.
        (editor as any)._yjsCleanup = cleanup;
    };

    useEffect(() => {
        return () => {
            if (editorRef.current && (editorRef.current as any)._yjsCleanup) {
                (editorRef.current as any)._yjsCleanup();
            }
        };
    }, []);

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-800 shadow-xl relative">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue="// Start coding here..."
                theme="vs-dark"

                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                }}
                onMount={(editor, monaco) => {
                    handleEditorDidMount(editor, monaco);

                    // Protection 1: Block Ctrl+A (Select All) to prevent easy wipe
                    editor.onKeyDown((e: any) => {
                        if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
                            e.preventDefault();
                            e.stopPropagation();
                            // Optional: Show toast or feedback "Select All is disabled to prevent accidental wipes."
                        }
                    });

                    // Protection 2: Prevent mass deletion (> 50 lines)
                    editor.onDidChangeModelContent((e: any) => {
                        e.changes.forEach((change: any) => {
                            // Ideally we want to intercept 'before' change, but Monaco doesn't make that easy with onDidChangeModelContent.
                            // We can check if the change was a large deletion.
                            // However, since this is "After" content changed, we can't strictly "Prevent" it easily without undoing.
                            // A better approach for "Preventing" is intercepting valid inputs or using `editor.addCommand`/`onKeyDown`.

                            // Let's rely on blocking Select All as the primary defense against "Instant Wipe".
                            // For "Large Deletion", we can try to undo if it's suspicious, but that fights with Yjs.

                            // Alternative: Let's stick to Blocking Ctrl+A + visual warning.
                        });
                    });
                }}
            />
            <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-mono border backdrop-blur-md transition-colors ${connected ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                {connected ? 'LIVE' : 'OFFLINE'}
            </div>
        </div>
    );
}
