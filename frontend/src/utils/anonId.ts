export const getAnonId = (): string => {
    const existingAnonId = localStorage.getItem('anonId');
    if (existingAnonId) {
      return existingAnonId;
    }
  
    // Generate a new anonId if not already present
    const newAnonId = `anon-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    localStorage.setItem('anonId', newAnonId);
    return newAnonId;
  };