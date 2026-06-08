"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

interface FeedbackButtonsProps {
  messageId: string;
}

export default function FeedbackButtons({ messageId }: FeedbackButtonsProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (selectedRating: number) => {
    setRating(selectedRating);
    if (selectedRating === -1) {
      setShowCommentBox(true);
    } else {
      setShowCommentBox(false);
      setLoading(true);
      try {
        await api.submitFeedback(messageId, 1);
        setSubmitted(true);
      } catch (err) {
        console.error("Failed to submit feedback:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null) return;
    setLoading(true);
    try {
      await api.submitFeedback(messageId, rating, comment);
      setSubmitted(true);
      setShowCommentBox(false);
    } catch (err) {
      console.error("Failed to submit comment feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <span className="font-mono text-[10px] text-[--text-tertiary] uppercase tracking-wider block mt-2">
        Feedback logged
      </span>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleFeedback(1)}
          disabled={loading}
          className={`font-mono text-[10px] uppercase tracking-wider transition ${
            rating === 1
              ? "text-[--accent]"
              : "text-[--text-tertiary] hover:text-[--text-secondary]"
          }`}
        >
          [Helpful]
        </button>
        <button
          onClick={() => handleFeedback(-1)}
          disabled={loading}
          className={`font-mono text-[10px] uppercase tracking-wider transition ${
            rating === -1
              ? "text-[--error]"
              : "text-[--text-tertiary] hover:text-[--text-secondary]"
          }`}
        >
          [Flag answer]
        </button>
      </div>

      {showCommentBox && (
        <form onSubmit={handleCommentSubmit} className="space-y-2 max-w-sm mt-3 border-b border-[--bg-border] pb-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-transparent resize-none outline-none font-body text-xs text-[--text-primary] placeholder:text-[--text-tertiary]"
            placeholder="Explain why this output is unhelpful..."
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="font-mono text-[10px] uppercase tracking-wider text-[--text-tertiary] hover:text-[--text-primary] transition"
            >
              [Cancel]
            </button>
            <button
              type="submit"
              disabled={loading}
              className="font-mono text-[10px] uppercase tracking-wider text-[--accent] hover:text-white transition"
            >
              [Submit]
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
