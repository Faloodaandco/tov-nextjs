'use client';
import React, { useState } from 'react';
import { Star, MessageSquare, Send, Heart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SHOP_CONFIG } from '@/config/shopConfig';

export const ReviewGate = () => {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [step, setStep] = useState<'rate' | 'happy' | 'feedback' | 'thanks'>('rate');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (val: number) => {
    setRating(val);
    setTimeout(() => {
      if (val >= 4) {
        setStep('happy');
      } else {
        setStep('feedback');
      }
    }, 400);
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'private_feedback'), {
        rating,
        feedback,
        source: 'review_gate',
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
    setStep('thanks');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[100dvh] bg-bg-sand flex items-center justify-center p-6 font-sans">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-terracotta blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-brand-pine blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-terracotta/20 backdrop-blur-md p-8 md:p-12 relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 'rate' && (
            <motion.div 
              key="rate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-sans font-black text-brand-text leading-tight uppercase tracking-wide">How was your<br/><span className="text-terracotta italic">experience</span> today?</h1>
                <p className="text-brand-text/60 font-medium normal-case">Your feedback helps us grow.</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    onClick={() => handleRating(star)}
                    className="group relative"
                  >
                    <Star 
                      size={42} 
                      className={`transition-all duration-300 ${
                        (hoveredRating || rating || 0) >= star 
                          ? 'fill-terracotta stroke-terracotta scale-110' 
                          : 'stroke-brand-text/20 fill-transparent'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'happy' && (
            <motion.div 
              key="happy"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
                <Heart size={40} className="fill-current" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-sans font-black text-brand-text uppercase tracking-wide">We're so glad!</h2>
                <p className="text-brand-text/60 normal-case">Sharing your experience on Google helps us more than you know.</p>
              </div>
              <a 
                href={SHOP_CONFIG.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-5 bg-brand-pine text-white rounded-[2rem] font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                Continue to Google <Send size={20} />
              </a>
              <button 
                onClick={() => setStep('rate')}
                className="text-brand-text/40 text-sm font-bold uppercase tracking-widest hover:text-brand-text/80 transition-colors"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {step === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-sans font-black text-brand-text uppercase tracking-wide">We're sorry!</h2>
                <p className="text-brand-text/60 text-sm normal-case">Please let us know what we can do better so management can fix it immediately.</p>
              </div>

              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What went wrong? Be honest..."
                className="w-full h-32 p-5 bg-bg-sand rounded-2xl border-none focus:ring-2 focus:ring-terracotta/50 outline-none resize-none font-medium text-brand-text"
              />

              <button 
                onClick={submitFeedback}
                disabled={!feedback || isSubmitting}
                className="w-full py-5 bg-terracotta text-white rounded-[2rem] font-bold text-lg shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                {isSubmitting ? 'Sending...' : 'Send to Management'} <MessageSquare size={20} />
              </button>
            </motion.div>
          )}

          {step === 'thanks' && (
            <motion.div 
              key="thanks"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="w-20 h-20 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto text-terracotta">
                <Check size={40} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-sans font-black text-brand-text uppercase tracking-wide">Thank you.</h2>
                <p className="text-brand-text/60 normal-case">Your feedback has been sent directly to our management team. We value your honesty.</p>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="w-full py-5 bg-brand-text/5 text-brand-text rounded-[2rem] font-bold text-lg hover:bg-brand-text/10 transition-colors uppercase tracking-wider"
              >
                Return to Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ReviewGate;
