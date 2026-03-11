import express from "express";
import { createServer as createViteServer } from "vite";
import Papa from "papaparse";

const app = express();
const PORT = 3000;

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1Xl9u22s457sLre-FjhkqVd_KwkSK57tyce3ve2LeW18/export?format=csv&gid=2067715452";

interface Product {
  Produto: string;
  "Venda 30ml": string;
  "Venda 65ml": string;
  "Venda 100ml": string;
}

let cachedProducts: Product[] = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchProducts() {
  const now = Date.now();
  if (cachedProducts.length > 0 && now - lastFetch < CACHE_DURATION) {
    return cachedProducts;
  }

  console.log("Fetching sheet from:", SHEET_URL);
  try {
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching sheet: ${response.status} ${response.statusText}`, errorText);
      if (response.status === 401 || response.status === 403) {
        throw new Error("A planilha não está acessível. Verifique se ela está compartilhada como 'Qualquer pessoa com o link pode ler'.");
      }
      throw new Error(`Erro ao acessar a planilha: ${response.status}`);
    }

    const csvText = await response.text();
    console.log("CSV fetched successfully, length:", csvText.length);
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.warn("CSV Parsing errors:", parsed.errors);
    }

    cachedProducts = parsed.data as Product[];
    console.log(`Parsed ${cachedProducts.length} products`);
    lastFetch = now;
    return cachedProducts;
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    throw error; // Let the route handler handle it
  }
}

async function startServer() {
  // API routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await fetchProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Erro interno ao carregar produtos" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
