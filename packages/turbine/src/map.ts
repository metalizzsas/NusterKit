/**
 * Convert a value from a range to another
 * @param x value
 * @param in_min range In Minimum
 * @param in_max range In Maximum
 * @param out_min range Out Minimun
 * @param out_max range Out Maximum
 * @returns X from the specified range
 */
export function map(x: number, in_min: number, in_max:number, out_min: number, out_max: number)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}