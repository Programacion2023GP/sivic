// similarityCheck.ts - VERSIÓN COMPLETA CORREGIDA

/**
 * Encuentra el elemento más similar en el array
 */
export function findMostSimilar<T>(array: T[], key: keyof T, text: any, minSimilarity: number = 40): { item: T; similarity: number } | null {
   if (!array || !array.length || !text) return null;

   const searchText = String(text).trim();

   // Si el texto de búsqueda es muy corto, ser más estricto
   const isShortSearch = searchText.length < 5;
   const adjustedMinSimilarity = isShortSearch ? Math.max(minSimilarity, 60) : minSimilarity;

   let bestMatch: { item: T; similarity: number } | null = null;

   for (const item of array) {
      const value = item[key];
      const similarity = calculateSimilarity(value, searchText, isShortSearch);

      if (similarity >= adjustedMinSimilarity) {
         if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { item, similarity };
         }
      }
   }

   return bestMatch;
}

/**
 * Función simple de uso
 */
export const findBestMatch = <T>(items: T[], field: keyof T, search: any): { item: T; percent: number } | null => {
   const result = findMostSimilar(items, field, search, 40);
   return result ? { item: result.item, percent: result.similarity } : null;
};

/**
 * Función que directamente devuelve el porcentaje
 */
export const getMatchPercent = <T>(items: T[], field: keyof T, search: any): number => {
   const result = findMostSimilar(items, field, search, 40);
   return result?.similarity || 0;
};

/**
 * Función que devuelve solo el item (sin porcentaje)
 */
export const findMatch = <T>(items: T[], field: keyof T, search: any, minPercent: number = 40): T | null => {
   const result = findMostSimilar(items, field, search, minPercent);
   return result?.item || null;
};

/**
 * Calcula similitud entre dos valores
 */
function calculateSimilarity(val1: any, val2: any, isShortSearch: boolean = false): number {
   // Si son exactamente iguales
   if (val1 === val2) return 100;

   // Si alguno es null/undefined/empty
   if (!val1 || !val2) return 0;

   const str1 = normalizeText(String(val1));
   const str2 = normalizeText(String(val2));

   // Igual después de normalizar
   if (str1 === str2) return 100;

   // Para búsquedas cortas, ser MÁS ESTRICTO
   if (isShortSearch) {
      return calculateSimilarityForShortSearch(str1, str2);
   }

   // Para búsquedas normales
   return calculateSimilarityForNormalSearch(str1, str2);
}

/**
 * Similaridad para búsquedas CORTAS
 */
function calculateSimilarityForShortSearch(str1: string, str2: string): number {
   if (str2.length < 3) return 0;

   const words1 = str1.split(" ");
   const words2 = str2.split(" ");

   // Para búsqueda de una sola palabra corta
   if (words2.length === 1) {
      const searchWord = words2[0];

      // Solo dar alta similitud si la palabra de búsqueda es una palabra COMPLETA
      const exactWordMatch = words1.some((w) => w === searchWord);

      if (exactWordMatch) {
         // Si es la PRIMERA palabra
         if (words1[0] === searchWord) {
            return str1.length <= 10 ? 70 : 60;
         }
         // Si no es la primera palabra
         return 50;
      }

      // Si no hay palabra exacta
      const bestWordMatch = words1.reduce((best, word) => {
         if (word.length < 3) return best;

         const distance = levenshteinDistance(searchWord, word);
         const similarity = (1 - distance / Math.max(searchWord.length, word.length)) * 100;

         return Math.max(best, similarity);
      }, 0);

      return Math.min(bestWordMatch * 0.7, 40);
   }

   // Para múltiples palabras cortas
   return calculateSimilarityForNormalSearch(str1, str2);
}

/**
 * Similaridad para búsquedas NORMALES
 */
function calculateSimilarityForNormalSearch(str1: string, str2: string): number {
   // 1. COINCIDENCIA DE PALABRAS COMPLETAS
   const words1 = str1.split(" ").filter((w) => w.length >= 3);
   const words2 = str2.split(" ").filter((w) => w.length >= 3);

   if (words1.length > 0 && words2.length > 0) {
      const commonWords = words1.filter((w1) => words2.some((w2) => w1 === w2)).length;

      if (commonWords > 0) {
         const totalWords = Math.max(words1.length, words2.length);
         const wordSimilarity = (commonWords / totalWords) * 100;

         let positionBonus = 0;

         // Bonus si la primera palabra coincide
         if (words1[0] === words2[0]) {
            positionBonus += 15;
         }

         // Bonus si la última palabra coincide (apellidos)
         if (words1[words1.length - 1] === words2[words2.length - 1]) {
            positionBonus += 20;
         }

         return Math.min(wordSimilarity + positionBonus, 95);
      }
   }

   // 2. COINCIDENCIA DE PRIMERA PALABRA
   const firstWord1 = str1.split(" ")[0];
   const firstWord2 = str2.split(" ")[0];

   if (firstWord1.length >= 3 && firstWord1 === firstWord2) {
      if (str1.split(" ").length === 1 && str2.split(" ").length === 1) {
         return 100;
      }

      if (str1.split(" ").length > 1 && str2.split(" ").length > 1) {
         const lastName1 = str1.split(" ").pop() || "";
         const lastName2 = str2.split(" ").pop() || "";

         if (lastName1 === lastName2) {
            return 90;
         }

         const lastNameSimilarity = calculateWordSimilarity(lastName1, lastName2);
         return 60 + lastNameSimilarity * 0.4;
      }

      return 50;
   }

   // 3. COINCIDENCIA DE APELLIDOS
   const lastName1 = str1.split(" ").pop() || "";
   const lastName2 = str2.split(" ").pop() || "";

   if (lastName1.length >= 3 && lastName1 === lastName2) {
      return 70;
   }

   // 4. SIMILITUD DE LETRAS
   if (str1.length <= 20 && str2.length <= 20) {
      const letterSimilarity = calculateLetterSimilarity(str1, str2);
      if (letterSimilarity >= 70) {
         return letterSimilarity;
      }
   }

   // 5. LEVENSHTEIN GENERAL
   const distance = levenshteinDistance(str1, str2);
   const maxLength = Math.max(str1.length, str2.length);
   const rawSimilarity = (1 - distance / maxLength) * 100;

   return rawSimilarity >= 50 ? Math.round(rawSimilarity) : 0;
}

/**
 * Similaridad entre dos palabras individuales
 */
function calculateWordSimilarity(word1: string, word2: string): number {
   if (word1 === word2) return 100;
   if (word1.length < 3 || word2.length < 3) return 0;

   const distance = levenshteinDistance(word1, word2);
   const maxLen = Math.max(word1.length, word2.length);
   const similarity = (1 - distance / maxLen) * 100;

   if (word1[0] !== word2[0]) {
      return similarity * 0.5;
   }

   return similarity;
}

/**
 * Similaridad por letras comunes
 */
function calculateLetterSimilarity(str1: string, str2: string): number {
   const letters1 = str1.replace(/\s/g, "").split("");
   const letters2 = str2.replace(/\s/g, "").split("");

   const commonLetters = letters1.filter((l) => letters2.includes(l)).length;
   const uniqueLetters = new Set([...letters1, ...letters2]).size;

   const jaccardSimilarity = (commonLetters / uniqueLetters) * 100;

   let orderBonus = 0;
   const minLen = Math.min(str1.length, str2.length);

   for (let i = 0; i < minLen; i++) {
      if (str1[i] === str2[i]) {
         orderBonus += 2;
      }
   }

   return Math.min(jaccardSimilarity + orderBonus, 100);
}

/**
 * Normaliza texto para comparación
 */
function normalizeText(text: string): string {
   return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
}

/**
 * Distancia de Levenshtein
 */
function levenshteinDistance(a: string, b: string): number {
   if (a.length === 0) return b.length;
   if (b.length === 0) return a.length;

   const matrix = [];

   for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
   }

   for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
   }

   for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
         const cost = a.charAt(j - 1) === b.charAt(i - 1) ? 0 : 1;
         matrix[i][j] = Math.min(matrix[i - 1][j - 1] + cost, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
   }

   return matrix[b.length][a.length];
}

/**
 * Función simple para comparación directa
 */
export const compareSimilarity = (value1: any, value2: any): number => {
   return calculateSimilarity(value1, value2, false);
};
