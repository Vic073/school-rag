"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquareCode } from "lucide-react";
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
      <span className="text-xs text-gray-500 italic mt-2 block">
        Thank you for your feedback!
      </span>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleFeedback(1)}
          disabled={loading}
          className={`p-1.5 rounded-lg border transition ${
            rating === 1
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
          title="Thumbs Up"
        >
          <ThumbsUp size={14} />
        </button>
        <button
          onClick={() => handleFeedback(-1)}
          disabled={loading}
          className={`p-1.5 rounded-lg border transition ${
            rating === -1
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
          }`}
          title="Thumbs Down"
        >
          <ThumbsDown size={14} />
        </button>
      </div>

      {showCommentBox && (
        <form onSubmit={handleCommentSubmit} className="space-y-2 max-w-sm mt-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2.5 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Help us improve. What was wrong with this answer?"
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="px-3 py-1 rounded-lg text-[10px] font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
