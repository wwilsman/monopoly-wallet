/**
 * Creates a property for actions to calculate a value within the rule middleware
 * @param {Function} get - Function to return a value from the rule meta
 */
export const calc = (get) => ({ __calc: true, get });
