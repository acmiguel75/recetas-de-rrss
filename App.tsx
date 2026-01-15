
import React, { useState, useEffect, useCallback } from 'react';
import { Recipe, AppView } from './types';
import { extractRecipeFromUrl } from './services/geminiService';
import { RecipeCard } from './components/RecipeCard';
import { BentoGrid } from './components/BentoGrid';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [view, setView] = useState<AppView>('list');
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchUrl, setSearchUrl] = useState('');

  // Initial Load
  useEffect(() => {
    const saved = localStorage.getItem('smart_recipes');
    if (saved) setRecipes(JSON.parse(saved));

    // Handle incoming share targets
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url') || urlParams.get('text');
    
    if (sharedUrl) {
      const extractedUrl = sharedUrl.match(/https?:\/\/[^\s]+/)?.[0];
      if (extractedUrl) {
        handleExtract(extractedUrl);
        // Clear query params to prevent re-processing on refresh
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('smart_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const handleExtract = async (url: string) => {
    if (!url) return;
    setIsExtracting(true);
    setView('loading');
    
    const recipe = await extractRecipeFromUrl(url);
    if (recipe) {
      setRecipes(prev => [recipe, ...prev]);
      setActiveRecipe(recipe);
      setView('detail');
    } else {
      alert("No pudimos extraer la receta. Intenta con otro link.");
      setView('list');
    }
    setIsExtracting(false);
    setSearchUrl('');
  };

  const deleteRecipe = (id: string) => {
    if (confirm("¿Seguro que quieres borrar esta receta?")) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      setView('list');
      setActiveRecipe(null);
    }
  };

  if (view === 'loading') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 mb-8 relative">
          <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cocinando tu receta...</h2>
        <p className="text-gray-500 leading-relaxed">Gemini está leyendo el video y organizando los ingredientes para ti.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 max-w-2xl mx-auto px-4 md:px-0">
      {/* Header */}
      {view === 'list' && (
        <header className="pt-16 pb-8 sticky top-0 z-20 apple-blur -mx-4 px-8 mb-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Mis Recetas</p>
              <h1 className="text-4xl font-black text-gray-900">Recetario</h1>
            </div>
            <div className="bg-orange-100 p-2 rounded-2xl">
               <span className="text-orange-600 font-bold px-2">{recipes.length}</span>
            </div>
          </div>

          {/* Quick Add */}
          <div className="mt-8 flex gap-2">
            <input 
              type="text" 
              placeholder="Pega un link de TikTok, Reels o YouTube..."
              className="flex-1 bg-white/50 border border-gray-200 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExtract(searchUrl)}
            />
            <button 
              onClick={() => handleExtract(searchUrl)}
              disabled={!searchUrl}
              className="bg-orange-500 text-white p-3 rounded-2xl disabled:opacity-50 transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="mt-4">
        {view === 'list' ? (
          <div className="grid grid-cols-2 gap-4">
            {recipes.length === 0 ? (
              <div className="col-span-2 py-20 text-center">
                <div className="text-6xl mb-4 opacity-20">🥗</div>
                <h3 className="text-xl font-semibold text-gray-400">Aún no tienes recetas</h3>
                <p className="text-gray-400 mt-2 text-sm">Comparte un video desde TikTok para empezar.</p>
              </div>
            ) : (
              recipes.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onClick={(r) => { setActiveRecipe(r); setView('detail'); window.scrollTo(0,0); }} 
                />
              ))
            )}
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom duration-500">
            {/* Detail View Header */}
            <div className="relative -mx-4">
               <button 
                onClick={() => setView('list')}
                className="absolute top-12 left-8 z-30 bg-white/80 backdrop-blur rounded-full p-2 shadow-lg active:scale-90 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => deleteRecipe(activeRecipe!.id)}
                className="absolute top-12 right-8 z-30 bg-red-50/80 backdrop-blur text-red-500 rounded-full p-2 shadow-lg active:scale-90 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <div className="h-[45vh] w-full relative">
                <img 
                  src={activeRecipe?.imageUrl} 
                  className="w-full h-full object-cover rounded-b-[40px]" 
                  alt={activeRecipe?.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60 rounded-b-[40px]" />
                <div className="absolute bottom-10 left-8 right-8">
                  <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">{activeRecipe?.category}</span>
                  <h1 className="text-white text-4xl font-black mt-2 leading-tight">{activeRecipe?.name}</h1>
                </div>
              </div>
            </div>

            {/* Bento Grid Info */}
            <div className="-mt-8 relative z-10">
               <BentoGrid 
                ingredients={activeRecipe!.ingredients} 
                steps={activeRecipe!.steps} 
                tips={activeRecipe!.tips}
                cookTime={activeRecipe!.cookTime}
              />
            </div>

            <div className="p-8 pb-20 text-center">
              <a 
                href={activeRecipe?.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors text-sm font-medium"
              >
                Ver video original
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Add FAB (Mobile) */}
      {view === 'list' && (
        <button 
          onClick={() => {
            const url = prompt("Pega aquí el link de la receta:");
            if (url) handleExtract(url);
          }}
          className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-90 z-50 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
