import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "https://hooks.jdoodle.net/proxy?url=https://script.google.com/macros/s/AKfycbz5WljFKX_W86-R_xGuecmPoNuxP-WqRPMI08hOBC8jYVgWntlxAY4ScySbCdBqhgfDew/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          timestamp: new Date().toISOString(),
          month: new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to submit form");
    }

    setSubmitted(true);
    setShowModal(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setShowModal(false);
    }, 2500);

  } catch (error) {
    console.error("Contact form submission error:", error);
    alert("Unable to send your message. Please try again.");
  }
};

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "welx@wellingtoncampus.co",
      description: "Send us an email anytime!",
      href: "mailto:welx@wellingtoncampus.co",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+971 54 252 3922",
      description: "Mon-Fri from 9am to 6pm",
      href: "tel:+971542523922",
    },
    {
      icon: MapPin,
      title: "Office",
      details: "Dubai Commerce City, Block 1, Office Number - 111",
      description: "Come say hello at our office!",
      href: "https://maps.google.com/?q=Dubai+Commerce+City+Block+1+Office+111",
    },
  ];

  return (
    <div className="welx-inner-page welx-contact-page">
      <div className="welx-inner-glow welx-inner-glow-one" aria-hidden="true" />
      <div className="welx-inner-glow welx-inner-glow-two" aria-hidden="true" />

      <header className="welx-inner-hero welx-contact-hero">
        <div className="welx-inner-shell welx-inner-hero-grid">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
            <nav className="welx-breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><b>Contact</b></nav>
            <p className="welx-inner-kicker">Let’s make your next move</p>
            <h1>Start a conversation.<br /><em>Build what’s next.</em></h1>
            <p>Tell us what you want to learn, launch, or improve. Our team will help you find the clearest next step.</p>
          </motion.div>
          <div className="welx-contact-pulse" aria-hidden="true"><i /><i /><i /><span><MessageCircle /><b>Say hello</b></span></div>
        </div>
      </header>

      <main className="welx-inner-shell welx-contact-content">
        <motion.section initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="welx-contact-form-card">
          <div className="welx-contact-card-heading"><span>01</span><div><p>Send a message</p><h2>What can we help you move forward?</h2></div></div>
          <form onSubmit={handleSubmit} className="welx-contact-form">
            <div className="welx-contact-row">
              <label><span>Name</span><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" required /></label>
              <label><span>Email</span><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" required /></label>
            </div>
            <label><span>Subject</span><input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="How can WELX help?" required /></label>
            <label><span>Message</span><textarea value={formData.message} onFocus={() => setIsTyping(true)} onBlur={() => setIsTyping(false)} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={5} className={isTyping ? "is-typing" : ""} placeholder="Tell us a little about your goal..." required /></label>
            <button type="submit"><Send /> Send message <span>↗</span></button>
          </form>
        </motion.section>

        <motion.aside initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="welx-contact-aside">
          <div className="welx-contact-card-heading"><span>02</span><div><p>Choose your channel</p><h2>Reach the right team.</h2></div></div>
          <div className="welx-contact-methods">
            {contactInfo.map((info, index) => (
              <motion.a key={info.title} href={info.href} target={info.title === "Office" ? "_blank" : undefined} rel={info.title === "Office" ? "noreferrer" : undefined} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.13 * index }}>
                <span><info.icon /></span><div><small>{info.title}</small><strong>{info.details}</strong><p>{info.description}</p></div><b>↗</b>
              </motion.a>
            ))}
          </div>
          <button className="welx-whatsapp-button" type="button" onClick={() => window.open("https://wa.me/971542523922", "_blank")}><MessageCircle /> Chat on WhatsApp <span>↗</span></button>
        </motion.aside>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Send size={40} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Message Sent!</h3>
              <p className="text-gray-600 mt-2">
                We'll get back to you shortly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
