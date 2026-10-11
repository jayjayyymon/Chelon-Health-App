const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+(?:\.\d{1,2})?$/;

type NumericValidation = {
  value: number | null;
  error: string | null;
};

function validateNumeric(
  input: string,
  pattern: RegExp,
  minimum: number,
  maximum: number,
  message: string,
): NumericValidation {
  const trimmed = input.trim();
  if (!pattern.test(trimmed)) return { value: null, error: message };
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    return { value: null, error: message };
  }
  return { value, error: null };
}

export const validateAge = (input: string) => validateNumeric(
  input,
  INTEGER_PATTERN,
  13,
  120,
  'Age must be a whole number from 13 to 120.',
);

export const validateHeight = (input: string) => validateNumeric(
  input,
  INTEGER_PATTERN,
  100,
  250,
  'Height must be a whole number from 100 to 250 cm.',
);

export const validateWeight = (input: string) => validateNumeric(
  input,
  DECIMAL_PATTERN,
  30,
  300,
  'Weight must be between 30 and 300 kg.',
);

export const validateWaterGoal = (input: string) => validateNumeric(
  input,
  DECIMAL_PATTERN,
  0.5,
  10,
  'Water goal must be between 0.5 and 10 L.',
);

export const validateName = (input: string): string | null => (
  input.trim().length >= 2 ? null : 'Name must be at least 2 characters.'
);

export type NumericFieldResult = NumericValidation;
