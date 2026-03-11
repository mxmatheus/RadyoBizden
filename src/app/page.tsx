'use client';

import { HeroSection } from "@/components/HeroSection";
import { Radio, Heart, Headphones } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const cards = [
    {
      title: "Sınırsız Keşif",
      description: "Türkiye'nin dört bir yanından 400'den fazla ulusal ve yerel radyo istasyonuna tek tıkla ulaşın. Kesintisiz müziğin keyfini çıkarın.",
      icon: Radio,
      link: "/radyolar",
      linkText: "Radyoları Keşfet",
      color: "from-blue-500/20 to-purple-500/20",
      borderColor: "group-hover:border-blue-500/50"
    },
    {
      title: "Favorilerinizi Ekleyin",
      description: "En sevdiğiniz radyo istasyonlarını favorilerinize ekleyerek kendi özel listenizi oluşturun. İstediğiniz an kolay erişin.",
      icon: Heart,
      link: "/favoriler",
      linkText: "Favorilerim",
      color: "from-pink-500/20 to-rose-500/20",
      borderColor: "group-hover:border-pink-500/50"
    },
    {
      title: "Yeni Müzikler",
      description: "Size en uygun yeni ve yükselen radyo kanallarını keşfedin. Güncel listelerle müzik zevkinizi genişletin.",
      icon: Headphones,
      link: "/kesfet",
      linkText: "Neler Yeni?",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "group-hover:border-emerald-500/50"
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <HeroSection />

      <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent my-4" />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={card.link} className={`block h-full p-8 rounded-3xl bg-gradient-to-br ${card.color} bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] transition-all duration-300 group ${card.borderColor}`}>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-white/70 leading-relaxed mb-6">
                  {card.description}
                </p>
                <span className="inline-flex items-center text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                  {card.linkText} <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
