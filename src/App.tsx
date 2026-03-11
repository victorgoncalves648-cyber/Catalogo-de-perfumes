import { useState, useEffect, useMemo } from 'react';
import { Search, Package, Droplets, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  Produto: string;
  "Venda 30ml": string;
  "Venda 65ml": string;
  "Venda 100ml": string;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Falha ao carregar produtos');
        }
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return products.filter(p => 
      p.Produto?.toLowerCase().includes(term)
    );
  }, [products, search]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Catálogo de Perfumes</h1>
          <p className="text-sm text-[#9e9e9e]">Consulte preços e tamanhos disponíveis</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-[#9e9e9e]" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome do produto..."
            className="w-full bg-white border border-black/5 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#9e9e9e]">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Carregando catálogo...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col items-center gap-4 text-red-700 text-center">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Erro ao carregar dados</h3>
              <p className="text-sm opacity-90 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  window.location.reload();
                }}
                className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={`${product.Produto}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-[#4a4a4a]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium leading-tight">{product.Produto}</h2>
                    <p className="text-xs text-[#9e9e9e] uppercase tracking-wider font-semibold mt-1">Disponibilidade</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { size: '30ml', price: product["Venda 30ml"] },
                    { size: '65ml', price: product["Venda 65ml"] },
                    { size: '100ml', price: product["Venda 100ml"] }
                  ].map((item) => (
                    <div 
                      key={item.size}
                      className="bg-[#f9f9f9] rounded-xl p-4 border border-black/[0.02] flex flex-col items-center justify-center text-center"
                    >
                      <div className="flex items-center gap-1.5 text-[#9e9e9e] text-xs font-medium uppercase mb-1">
                        <Droplets className="w-3 h-3" />
                        {item.size}
                      </div>
                      <div className="text-lg font-semibold text-[#1a1a1a]">
                        {item.price && item.price !== '-' ? (
                          `R$ ${item.price}`
                        ) : (
                          <span className="text-[#d1d1d1] font-normal italic">Indisponível</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {search && filteredProducts.length === 0 && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black/5 rounded-full mb-4">
                <Search className="w-8 h-8 text-[#d1d1d1]" />
              </div>
              <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
              <p className="text-[#9e9e9e]">Tente pesquisar por outro nome ou termo.</p>
            </motion.div>
          )}

          {!search && !loading && (
            <div className="text-center py-20 text-[#9e9e9e]">
              <p>Digite o nome de um perfume para ver os preços.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-4 py-12 text-center text-[#9e9e9e] text-xs">
        <p>© {new Date().getFullYear()} Catálogo de Perfumes. Dados sincronizados da planilha oficial.</p>
      </footer>
    </div>
  );
}

