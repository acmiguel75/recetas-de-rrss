
import React from 'react';
import { Recipe } from '../types.ts';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <button 
      onClick={() => onClick(recipe)}
      className="group relative w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-white shadow-lg transition-transform active:scale-95 duration-300 text-left"
    >
      <img 
        src={recipe.imageUrl} 
        alt={recipe.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 p-6 w-full">
        <span className="px-2 py-1 rounded-full bg-orange-500 text-[10px] font-bold text-white uppercase tracking-widest mb-2 inline-block">
          {recipe.category || 'Receta'}
        </span>
        <h3 className="text-white text-xl font-bold leading-tight line-clamp-2">{recipe.name}</h3>
        <p className="text-white/70 text-sm mt-1">{recipe.cookTime}</p>
      </div>
    </button>
  );
};
