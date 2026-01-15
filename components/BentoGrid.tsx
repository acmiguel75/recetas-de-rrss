
import React from 'react';

interface BentoBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const BentoBox: React.FC<BentoBoxProps> = ({ title, children, className = "" }) => (
  <div className={`p-6 rounded-[28px] apple-blur border border-white/30 shadow-sm ${className}`}>
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">{title}</h3>
    <div className="text-gray-800">{children}</div>
  </div>
);

export const BentoGrid: React.FC<{ ingredients: string[], steps: string[], tips: string[], cookTime: string }> = ({ 
  ingredients, steps, tips, cookTime 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
      {/* Time & Quick Look */}
      <BentoBox title="Tiempo" className="md:col-span-2 flex items-center justify-center">
        <div className="text-3xl font-bold text-orange-500">{cookTime}</div>
      </BentoBox>

      {/* Ingredients */}
      <BentoBox title="Ingredientes" className="md:col-span-4 md:row-span-2">
        <ul className="space-y-2">
          {ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-orange-200 mt-1.5 shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </BentoBox>

      {/* Pro Tips */}
      <BentoBox title="Trucos del Chef" className="md:col-span-2 bg-green-50/50">
        <ul className="space-y-2 italic text-sm text-green-800">
          {tips.map((tip, i) => (
            <li key={i}>✨ {tip}</li>
          ))}
        </ul>
      </BentoBox>

      {/* Steps - Large Area */}
      <BentoBox title="Instrucciones" className="md:col-span-6">
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-2xl font-black text-gray-200 shrink-0">{(i + 1).toString().padStart(2, '0')}</span>
              <p className="text-md leading-relaxed text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </BentoBox>
    </div>
  );
};
