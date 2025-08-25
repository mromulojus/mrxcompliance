// Utility para limpar cache de boards
export const clearBoardsCache = () => {
  // Limpar todos os caches relacionados a boards
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith('boards_ensured_')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('Cache de boards limpo');
};

// Executar automaticamente quando importado em desenvolvimento
if (import.meta.env.DEV) {
  clearBoardsCache();
}