/**
 * Convert a value from a range to another
 * @param source value
 * @param inMin range In Minimum
 * @param inMax range In Maximum
 * @param outMin range Out Minimun
 * @param outMax range Out Maximum
 * @returns X from the specified range
 */
export function map(source: number, inMin: number, inMax: number, outMin: number, outMax: number)
{
  return (source - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}