'use client';
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UtensilsCrossed, Flame, Cookie } from 'lucide-react';

const dishes = [
  {
    id: 1,
    title: "AUTHENTIC KARAHI",
    description: "Chicken and Lamb Karahi, cooked to order in traditional iron woks with fresh tomatoes, ginger, and our secret spice blend.",
    icon: UtensilsCrossed,
    image: "/assets/chicken_karahi_hero.webp" // using existing image
  },
  {
    id: 2,
    title: "CHARCOAL GRILLS",
    description: "Seekh kebabs, lamb chops, and chicken tikka marinated overnight in yoghurt and rustic spices, grilled to smoky perfection.",
    icon: Flame,
    image: "/assets/chicken_karahi_hero.webp" // reusing image for demo
  },
  {
    id: 3,
    title: "VILLAGE BREADS",
    description: "Piping hot naans, tandoori rotis, and buttery parathas slapped against the wall of our clay oven.",
    icon: Cookie,
    image: "/assets/chicken_karahi_hero.webp" // reusing image for demo
  }
];

export const FoodCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="w-full relative py-10 overflow-hidden cursor-grab active:cursor-grabbing interactive" ref={containerRef}>
      <motion.div 
        drag="x"
        dragConstraints={containerRef}
        className="flex gap-8 px-[10vw] md:px-[30vw]"
      >
        {dishes.map((dish, i) => (
          <motion.div
            key={dish.id}
            whileHover={{ scale: 1.05 }}
            className="min-w-[300px] md:min-w-[400px] shrink-0 p-10 bg-white/5 border-2 border-white/10 transition-all duration-300 group relative overflow-hidden shadow-[8px_8px_0px_rgba(20,40,29,1)] rounded-none"
          >
            <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
              <img src={dish.image} alt={dish.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-4 rounded-none border-2 border-white/10 bg-black/40 backdrop-blur-md mb-8 group-hover:bg-terracotta/40 transition-colors duration-500">
                <dish.icon className="w-10 h-10 text-bg-sand group-hover:text-white group-hover:scale-110 transition-all duration-500" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-[0.1em] text-white drop-shadow-md">{dish.title}</h3>
              <p className="text-bg-sand text-base leading-relaxed mb-8 normal-case font-medium drop-shadow-md bg-black/30 p-4 backdrop-blur-sm">
                {dish.description}
              </p>
              <span className="mt-auto text-terracotta-light font-bold uppercase tracking-[0.2em] text-sm group-hover:text-white transition-colors bg-black/50 px-4 py-2">Swipe to Explore →</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
      <div className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white/50 pointer-events-none opacity-0 md:opacity-100">&larr;</div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white/50 pointer-events-none opacity-0 md:opacity-100">&rarr;</div>
    </div>
  );
};
