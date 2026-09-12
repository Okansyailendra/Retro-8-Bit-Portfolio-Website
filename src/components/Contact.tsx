import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import emailjs from '@emailjs/browser';
import PixelBox from './PixelBox';

// ─── Configure EmailJS ──────────────────────────────────────────────────────
// 1. Sign up at https://www.emailjs.com
// 2. Create a service, template, and get your public key
// 3. Replace these placeholders:
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
// ───────────────────────────────────────────────────────────────────────────

const SOCIALS = [
  { label: 'GITHUB',   icon: '◈', url: '#', color: '#ffd700' },
  { label: 'LINKEDIN', icon: '◉', url: '#', color: '#00e5ff' },
  { label: 'TWITTER',  icon: '◆', url: '#', color: '#39ff14' },
  { label: 'EMAIL',    icon: '✉', url: 'mailto:you@example.com', color: '#ff6ec7' },
];

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const formRef = useRef<HTMLFormElement>(null);

  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendStatus === 'sending') return;

    setSendStatus('sending');
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current!,
        EMAILJS_PUBLIC_KEY
      );
      setSendStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSendStatus('error');
    }
  };

  return (
    <section className="min-h-screen bg-bg py-16 px-4 pt-20 flex flex-col items-center">
      <div className="pixel-divider w-full mb-10" />

      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="font-pixel text-xs sm:text-sm text-gold glow-gold mb-2">
            ▶ SAVE GAME DATA ◀
          </div>
          <h2 className="font-pixel text-gold text-lg sm:text-2xl glow-gold mb-2">CONTACT</h2>
          <div className="font-vt text-xl text-gold opacity-60">
            Leave a message — I'll respond within 24 hours
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PixelBox color="#ffd700" glow className="p-5">
              <div className="font-pixel text-gold text-[9px] mb-4 tracking-widest border-b-2 border-gold pb-2 glow-gold">
                ▶ NEW SAVE FILE
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-pixel text-[7px] text-gold mb-1 block opacity-70">PLAYER NAME</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="pixel-input"
                    />
                  </div>
                  <div>
                    <label className="font-pixel text-[7px] text-gold mb-1 block opacity-70">EMAIL ADDR</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@mail.com"
                      required
                      className="pixel-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-pixel text-[7px] text-gold mb-1 block opacity-70">QUEST TITLE</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Let's collaborate!"
                    required
                    className="pixel-input"
                  />
                </div>

                <div>
                  <label className="font-pixel text-[7px] text-gold mb-1 block opacity-70">MESSAGE LOG</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message here..."
                    required
                    rows={5}
                    className="pixel-input"
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={sendStatus === 'sending'}
                  className="pixel-btn font-pixel text-[9px] w-full py-3 text-gold"
                  whileTap={{ scale: 0.97 }}
                >
                  {sendStatus === 'sending'
                    ? '▶▶ TRANSMITTING...'
                    : sendStatus === 'success'
                    ? '✓ MESSAGE SAVED!'
                    : sendStatus === 'error'
                    ? '✕ RETRY SEND'
                    : '▶ SEND MESSAGE'}
                </motion.button>

                {sendStatus === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-vt text-neon text-lg text-center glow-neon"
                  >
                    ★ MESSAGE DELIVERED! I'll respond ASAP. ★
                  </motion.p>
                )}
                {sendStatus === 'error' && (
                  <p className="font-vt text-red text-lg text-center">
                    ✕ TRANSMISSION FAILED. Check your EmailJS config.
                  </p>
                )}
              </form>
            </PixelBox>
          </motion.div>

          {/* Right panel */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Social links */}
            <PixelBox color="#ff6ec7" className="p-4">
              <div className="font-pixel text-pink text-[9px] mb-4 glow-pink tracking-widest border-b-2 border-pink pb-2">
                FIND ME ONLINE
              </div>
              <div className="space-y-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    className="flex items-center gap-3 p-2 transition-all hover:pl-4"
                    style={{
                      border: `2px solid ${s.color}44`,
                      color: s.color,
                      cursor: 'none',
                    }}
                  >
                    <span className="font-pixel text-base">{s.icon}</span>
                    <span className="font-pixel text-[8px]">{s.label}</span>
                    <span className="ml-auto font-pixel text-[8px] opacity-50">▶</span>
                  </a>
                ))}
              </div>
            </PixelBox>

            {/* Game over card */}
            <PixelBox color="#39ff14" bg="#061206" className="p-4">
              <div className="text-center">
                <div className="font-pixel text-neon text-xs mb-3 glow-neon blink">
                  GAME OVER?
                </div>
                <div className="font-vt text-neon text-xl leading-relaxed mb-3">
                  Not if we team up!<br />
                  Let's build something<br />
                  <span className="text-gold">legendary</span> together.
                </div>
                <div className="font-pixel text-[7px] text-neon opacity-60">
                  AVAILABLE FOR: FREELANCE ◈ FULLTIME ◈ COLLAB
                </div>
              </div>
            </PixelBox>

            {/* Quick stats */}
            <PixelBox color="#2a2a6e" className="p-4">
              <div className="font-pixel text-[8px] text-gold mb-3 opacity-70">RESPONSE TIME</div>
              <div className="space-y-2 font-vt text-lg">
                {[
                  { label: 'Email', val: '< 24h', color: '#39ff14' },
                  { label: 'LinkedIn', val: '< 4h', color: '#00e5ff' },
                  { label: 'Twitter', val: '< 1h', color: '#ffd700' },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-gold opacity-70">{r.label}:</span>
                    <span style={{ color: r.color }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </PixelBox>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12 pb-8"
        >
          <div className="pixel-divider w-full mb-6" />
          <div className="font-pixel text-gold text-[8px] glow-gold mb-2">
            THANKS FOR PLAYING
          </div>
          <div className="font-vt text-gold text-xl opacity-50">
            © 2026 Okan Syailendra Wahyudi — Made with effort & too much coffee
          </div>
          <div className="font-pixel text-[7px] text-gold opacity-30 mt-2">
            ★ Kannz.Dev — LEVEL 42 — 7200 XP ★
          </div>
        </motion.div>
      </div>
    </section>
  );
}
