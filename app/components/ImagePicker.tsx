"use client";

import { useEffect, useRef } from "react";
import { useImagePicker } from "../hooks/useImagePicker";

interface ImagePickerProps {
  onChange?: (file: File | null) => void;
  label?: string;
  required?: boolean;
}

export function ImagePicker({
  onChange,
  label = "Draft/Lobby Screenshot",
  required = false,
}: ImagePickerProps) {
  const { imageFile, preview, handleFileInput } = useImagePicker();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange?.(imageFile);
  }, [imageFile, onChange]);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
        {label}{" "}
        {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>

      <div
        className="relative border-2 border-dashed border-[var(--border)] rounded-lg p-4 bg-[var(--secondary)]/20 hover:border-[var(--primary)] transition-all cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--foreground)]/50 pointer-events-none select-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16l4-4m0 0l4 4m-4-4v9M7 4h10a2 2 0 012 2v5"
              />
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                strokeWidth={1.5}
              />
            </svg>
            <p className="text-sm">
              Click to upload or{" "}
              <kbd className="px-1 py-0.5 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded">
                Ctrl+V
              </kbd>{" "}
              /{" "}
              <kbd className="px-1 py-0.5 text-xs bg-[var(--secondary)] border border-[var(--border)] rounded">
                ⌘V
              </kbd>{" "}
              to paste
            </p>
            <p className="text-xs">PNG, JPG, GIF, WEBP</p>
          </div>
        )}
      </div>

      {imageFile && (
        <div className="mt-2 flex items-center justify-between text-sm text-[var(--foreground)]">
          <div className="flex items-center gap-2">
            <span className="font-medium">Selected:</span>
            <span className="truncate max-w-[200px]">
              {imageFile.name || "pasted-image.png"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onChange?.(null);
            }}
            className="text-xs text-red-500 dark:text-red-400 hover:underline"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
