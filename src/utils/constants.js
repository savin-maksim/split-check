export const VALIDATION_RULES = {
  PERSON: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },
  COST: {
    TITLE_MIN_LENGTH: 2,
    TITLE_MAX_LENGTH: 100,
    MAX_AMOUNT: 1000000,
    MIN_AMOUNT: 0, // Allows free items
    MIN_QUANTITY: 0
  }
};
