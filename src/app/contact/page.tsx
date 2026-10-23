"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { APP_NAME } from "@/lib/constants";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-12">
        <Container className="max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[10px] font-black uppercase text-[#0c4a3e] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
              Get In Touch
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#132a24] tracking-tight mt-2">
              Contact {APP_NAME} Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Have questions regarding listing your property, account moderation, or statutory verification? Our Coimbatore team is here to assist.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[#e2e8e4] shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-[#132a24] uppercase tracking-wide">
                  Coimbatore Office
                </h3>

                <div className="flex items-start gap-3 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-[#0c4a3e] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Headquarters:</strong>
                    <span>424 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-600">
                  <Phone className="w-4 h-4 text-[#0c4a3e] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Phone Support:</strong>
                    <span>+91 422 2345678 (Mon - Sat, 9am - 7pm)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-600">
                  <Mail className="w-4 h-4 text-[#0c4a3e] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 block">Email:</strong>
                    <span>support@landora.in</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <h4 className="font-bold text-sm text-[#0c4a3e]">Verification & Moderation</h4>
                <p className="text-slate-600 leading-relaxed">
                  To request express verification for layout approvals (DTCP/CMDA) or report unauthorized brokers, write to:
                </p>
                <p className="font-mono text-xs font-semibold text-[#0c4a3e]">
                  moderation@landora.in
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8e4] shadow-xs">
              {submitted ? (
                <div className="p-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#0c4a3e] mx-auto animate-bounce" />
                  <h3 className="text-xl font-bold text-[#0c4a3e]">Message Sent!</h3>
                  <p className="text-xs text-slate-600">
                    Thank you, {formData.name}. Our support team will get in touch with you within 24 business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      placeholder="e.g. Sivakumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                    <Input
                      label="Subject"
                      placeholder="e.g. Inquiry regarding Peelamedu Plot"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 px-3.5 py-2.5 focus:border-[#0c4a3e] focus:outline-none focus:ring-1 focus:ring-[#0c4a3e]"
                      placeholder="How can we assist you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full justify-center">
                    <Send className="w-4 h-4 mr-1.5" />
                    <span>Send Message</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
