"use client";

import { useEffect, useRef } from "react";

export default function RichTextEditor({ value, onChange, placeholder }) {
    const containerRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);

    // Keep onChange ref current without re-initializing Quill
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (quillRef.current) return; // Already initialized

        const initQuill = async () => {
            const Quill = (await import("quill")).default;

            // Import Quill CSS dynamically
            await import("quill/dist/quill.snow.css");

            if (!containerRef.current) return;

            const toolbarOptions = [
                [{ header: [1, 2, 3, false] }],
                [{ font: [] }],
                [{ size: ["small", false, "large", "huge"] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "blockquote"],
                ["clean"],
            ];

            const quill = new Quill(containerRef.current, {
                theme: "snow",
                placeholder: placeholder || "Write your content here...",
                modules: {
                    toolbar: toolbarOptions,
                },
            });

            quillRef.current = quill;

            // Set initial value
            if (value) {
                quill.root.innerHTML = value;
            }

            // Listen for changes
            quill.on("text-change", () => {
                const html = quill.root.innerHTML;
                // Treat empty editor as empty string
                const isEmpty = quill.getText().trim().length === 0;
                onChangeRef.current(isEmpty ? "" : html);
            });
        };

        initQuill();

        return () => {
            // Cleanup: destroy quill instance
            if (quillRef.current) {
                quillRef.current = null;
            }
        };
    }, []); // Only run once on mount

    // Sync external value changes (e.g. form reset) without re-initializing
    useEffect(() => {
        if (!quillRef.current) return;
        const currentHtml = quillRef.current.root.innerHTML;
        if (value !== currentHtml) {
            quillRef.current.root.innerHTML = value || "";
        }
    }, [value]);

    return (
        <div className="quill-wrapper rounded-lg border border-input overflow-hidden">
            <div ref={containerRef} style={{ minHeight: "280px" }} />
            <style>{`
                .quill-wrapper .ql-toolbar {
                    border: none;
                    border-bottom: 1px solid hsl(var(--border, 214 32% 91%));
                    background: hsl(var(--muted, 210 40% 96%));
                    flex-wrap: wrap;
                }
                .quill-wrapper .ql-container {
                    border: none;
                    font-size: 15px;
                    font-family: inherit;
                }
                .quill-wrapper .ql-editor {
                    min-height: 280px;
                    padding: 16px;
                    line-height: 1.7;
                }
                .quill-wrapper .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                }
                .quill-wrapper .ql-editor p {
                    margin-bottom: 0.5em;
                }
            `}</style>
        </div>
    );
}
