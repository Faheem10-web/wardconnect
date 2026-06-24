'use client';

import { motion } from 'framer-motion';
import { Landmark, Compass, Award, Clock, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  const values = [
    {
      title: 'Platform Purpose',
      desc: 'WardConnect was founded to eliminate red tape in municipal processes. We provide direct digital channels for citizens to voice concerns, helping local authorities identify, track, and fix infrastructure issues quickly.',
      icon: Compass,
      color: 'text-primary-600 bg-primary-50',
    },
    {
      title: 'Citizen Benefits',
      desc: 'Citizens can report issues in real-time, get automatic progress updates, view resolving timelines, and access historical complaint tracking without making a single trip to the municipal office.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Ward Service Quality',
      desc: 'Every submitted report is assigned directly to a local ward inspector. We maintain high standards of accountability, ensuring reports are handled systematically and verified upon completion.',
      icon: Award,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="py-16 sm:py-24 space-y-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-text-title tracking-tight">
          Connecting Citizens With Ward Administration
        </h1>
        <p className="text-text-body text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
          WardConnect is a dedicated municipal service platform facilitating visual, localized problem solving for public works, utilities, and community safety.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white border border-card-border rounded-2xl p-8 space-y-4 shadow-sm"
              >
                <div className={`p-3 rounded-xl w-fit ${v.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-text-title">{v.title}</h3>
                <p className="text-text-body text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-card-border rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" /> Ward Service & Support
            </span>
            <h2 className="font-display font-bold text-3xl text-text-title">
              Ward 4 Administration Details
            </h2>
            <p className="text-text-body text-sm leading-relaxed">
              Our ward administration covers an area of approximately 14 square kilometers, serving over 85,000 residents. The Ward 4 Public Works department works hand-in-hand with municipal inspectors to keep roads, water conduits, lights, and environment services operational.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-bg-base text-text-body rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-title text-sm">Working Hours</h4>
                  <p className="text-xs text-text-body/70">Mon - Fri: 9:00 AM - 5:00 PM</p>
                  <p className="text-xs text-text-body/70">Sat: 9:00 AM - 1:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-bg-base text-text-body rounded-lg">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-title text-sm">Emergency Hotlines</h4>
                  <p className="text-xs text-text-body/70">Fire & Safety: 911</p>
                  <p className="text-xs text-text-body/70">Water Outage: +1 (555) 012-9900</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-bg-base p-6 sm:p-8 rounded-2xl border border-card-border space-y-4">
            <h3 className="font-display font-bold text-lg text-text-title">Our Committed Standards</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-sm text-text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0" />
                <span><strong>24-Hour Review</strong>: Every complaint is reviewed by an inspector within 24 hours of submission.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0" />
                <span><strong>Status Tracking</strong>: Transparent logs for every status change, visible to the reporter.</span>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-2 shrink-0" />
                <span><strong>Verification Checks</strong>: Inspectors must capture post-resolution images to finalize cases.</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/complaints"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                File an Issue Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
