"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AttachedImage, ImageMediaType } from "@/types/chat";

const ALLOWED_TYPES: ImageMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILES = 4;
const MAX_SIZE_MB = 5;

interface Props {
  onSend: (content: string, images: AttachedImage[]) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  // 컴포넌트 언마운트 시 object URL 해제
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const processFiles = useCallback(async (files: File[]) => {
    const valid = files.filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type as ImageMediaType)) return false;
      if (f.size > MAX_SIZE_MB * 1024 * 1024) return false;
      return true;
    });

    const remaining = MAX_FILES - images.length;
    const toAdd = valid.slice(0, remaining);

    const processed = await Promise.all(
      toAdd.map(async (file): Promise<AttachedImage> => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // data:image/jpeg;base64,... 에서 base64 부분만 추출
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });

        return {
          id: crypto.randomUUID(),
          previewUrl: URL.createObjectURL(file),
          base64,
          mediaType: file.type as ImageMediaType,
        };
      })
    );

    setImages((prev) => [...prev, ...processed]);
  }, [images.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if ((!trimmed && images.length === 0) || isLoading) return;
    onSend(trimmed, images);
    setValue("");
    setImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/10 px-4 py-4 light:border-black/10">
      <div className="mx-auto max-w-2xl">
        <div
          className={`rounded-2xl bg-[#2f2f2f] transition-colors light:bg-gray-100 ${
            isDragging ? "ring-2 ring-blue-500" : ""
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* 이미지 미리보기 */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {images.map((img) => (
                <div key={img.id} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.previewUrl}
                    alt="첨부 이미지"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 입력 영역 */}
          <div className="flex items-end gap-2 px-4 py-3">
            {/* 이미지 첨부 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || images.length >= MAX_FILES}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-200 disabled:opacity-30 light:text-gray-500 light:hover:text-gray-700"
              aria-label="이미지 첨부"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isDragging ? "이미지를 놓으세요..." : "메시지를 입력하세요... (Shift+Enter로 줄바꿈)"}
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-500 outline-none disabled:opacity-50 light:text-gray-900 light:placeholder-gray-400"
            />

            <button
              onClick={handleSubmit}
              disabled={(!value.trim() && images.length === 0) || isLoading}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-black transition-opacity disabled:opacity-30"
              aria-label="전송"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-2 text-center text-xs text-gray-600">
          AI는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
