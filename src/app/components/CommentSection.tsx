import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

interface CommentSectionProps {
  articleTitle: string;
}

export function CommentSection({ articleTitle }: CommentSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; comment?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; comment?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Comment is required';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        description: 'Check all required fields and try again',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Comment submitted successfully!', {
        description: 'Thank you for your feedback. Your comment is awaiting moderation.',
        duration: 5000,
      });

      // Reset form
      setName('');
      setEmail('');
      setComment('');
      setErrors({});
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-[#EFB81A]" />
        <h3 className="text-gray-800 dark:text-[#F3F3F5] text-xl md:text-2xl">Leave a Comment</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.name 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-200 dark:border-gray-800'
            } bg-white dark:bg-[#0F0F10] text-gray-800 dark:text-[#F3F3F5] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#EFB81A] dark:focus:border-[#EFB81A] transition-colors`}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="comment-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-200 dark:border-gray-800'
            } bg-white dark:bg-[#0F0F10] text-gray-800 dark:text-[#F3F3F5] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#EFB81A] dark:focus:border-[#EFB81A] transition-colors`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Comment Field */}
        <div>
          <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment-text"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (errors.comment) setErrors({ ...errors, comment: undefined });
            }}
            rows={5}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.comment 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-200 dark:border-gray-800'
            } bg-white dark:bg-[#0F0F10] text-gray-800 dark:text-[#F3F3F5] placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#EFB81A] dark:focus:border-[#EFB81A] transition-colors resize-none`}
            placeholder="Share your thoughts about this article..."
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-500">{errors.comment}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Minimum 10 characters required
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-[#EFB81A] text-white rounded-lg hover:bg-[#d9a615] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Comment
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Your email will not be published. All comments are moderated before being published.
      </p>
    </div>
  );
}
