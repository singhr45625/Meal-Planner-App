export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateMealForm = (formData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.title?.trim()) {
    errors.push('Title is required');
  }

  if (!formData.description?.trim()) {
    errors.push('Description is required');
  }

  if (!formData.category) {
    errors.push('Category is required');
  }

  if (!formData.cookingTime || formData.cookingTime <= 0) {
    errors.push('Cooking time must be greater than 0');
  }

  if (!formData.ingredients || formData.ingredients.length === 0) {
    errors.push('At least one ingredient is required');
  }

  if (!formData.instructions || formData.instructions.length === 0) {
    errors.push('At least one instruction is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};