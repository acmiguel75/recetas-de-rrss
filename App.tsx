
import React, { useState, useEffect } from 'react';
import { Recipe, AppView } from './types.ts';
import { extractRecipeFromUrl } from './services/geminiService.ts';
import { RecipeCard } from './components/RecipeCard.tsx';
import { BentoGrid } from './components/BentoGrid.tsx';

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [view, setView] = useState<AppView>('list');
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchUrl, setSearchUrl] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('smart_recipes');
    if (saved) setRecipes(JSON.parse(saved));

    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url') || urlParams.get('text');
    
    if (sharedUrl) {
      const extractedUrl = sharedUrl.match(/https?:\/\/[^\s]+/)?.[0];
      if (extractedUrl) {
        handleExtract(extractedUrl);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

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
      alert("Lo sentimos, no pudimos procesar esa receta.");
      setView('list');
    }
    setIsExtracting(false);
    setSearchUrl('');
  };

  const deleteRecipe = (id: string) => {
    if (confirm("¿Borrar esta receta permanentemente?")) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      setView('list');
      setActiveRecipe(null);
    }
  };

  if (view === 'loading') {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-12 text-center animate-fade-in">
        <div className="relative w-24 h-24 mb-10">
          <div className="absolute inset-0 border-[6px] border-orange-100 rounded-full"></div>
          <div className="absolute inset-0 border-[6px] border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">Analizando ingredientes...</h2>
        <p className="text-gray-500 text-lg max-w-xs leading-relaxed">Gemini está procesando el video y buscando información adicional en la web.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] safe-area-bottom">
      {view === 'list' && (
        <div className="max-w-2xl mx-auto px-6 pt-12 animate-fade-in">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <p className="text-orange-500 font-bold text-xs uppercase tracking-[0.2em] mb-1">Tu Colección</p>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Recetario</h1>
            </div>
            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-white">
              <span className="text-lg font-bold text-gray-800">{recipes.length}</span>
            </div>
          </header>

          <div className="mb-10 group">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Pega link de TikTok, YouTube o Reels"
                className="w-full bg-white border-0 rounded-[22px] px-6 py-4 shadow-sm text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none pr-14"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExtract(searchUrl)}
              />
              <button 
                onClick={() => handleExtract(searchUrl)}
                disabled={!searchUrl}
                className="absolute right-2 bg-orange-500 text-white p-2.5 rounded-[18px] disabled:opacity-30 active:scale-90 transition-transform shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {recipes.length === 0 ? (
              <div className="col-span-2 py-32 text-center opacity-40">
                <div className="text-5xl mb-4">🍳</div>
                <p className="text-sm font-medium">Comparte un video para empezar</p>
              </div>
            ) : (
              recipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onClick={(r) => { setActiveRecipe(r); setView('detail'); window.scrollTo(0,0); }} />
              ))
            )}
          </div>
        </div>
      )}

      {view === 'detail' && activeRecipe && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="relative h-[55vh] w-full">
            <img src={activeRecipe.imageUrl} className="w-full h-full object-cover" alt={activeRecipe.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F2F2F7] via-transparent to-black/20" />
            
            <button 
              onClick={() => setView('list')}
              className="absolute top-12 left-6 bg-white/90 backdrop-blur rounded-full p-3 shadow-xl active:scale-90 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <button 
              onClick={() => deleteRecipe(activeRecipe.id)}
              className="absolute top-12 right-6 bg-red-50/90 backdrop-blur text-red-500 rounded-full p-3 shadow-xl active:scale-90 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>

            <div className="absolute bottom-8 left-8 right-8">
              <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block shadow-lg">
                {activeRecipe.category || 'Receta'}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">{activeRecipe.name}</h1>
            </div>
          </div>

          <div className="px-4 -mt-6">
            <BentoGrid 
              ingredients={activeRecipe.ingredients} 
              steps={activeRecipe.steps} 
              tips={activeRecipe.tips}
              cookTime={activeRecipe.cookTime}
            />
          </div>

          {activeRecipe.sources && activeRecipe.sources.length > 0 && (
            <div className="p-8 mb-10 mx-4 rounded-[28px] bg-white border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Fuentes de Google Search</h4>
              <div className="flex flex-wrap gap-3">
                {activeRecipe.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    className="text-sm font-semibold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors inline-block"
                  >
                    {source.title || "Ver fuente"}
                  </a>
                ))}
              </div>
            </div>
          )}

          <footer className="py-12 text-center">
             <a 
              href={activeRecipe.sourceUrl} 
              target="_blank" 
              className="text-gray-400 text-sm font-medium hover:text-orange-500 transition-colors"
            >
              Original en Social Media
            </a>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
