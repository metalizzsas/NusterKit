import type * as TWColors from "tailwindcss/colors";

type context = "ring" | "bg" | "text";
type levels = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type alpha = "" | "/0" | "/5" | "/10" | "/20" | "/25" | "/30" | "/40" | "/50" | "/60" | "/70" | "/75" | "/80" | "/90" | "/95" | "/100";
type rootKeys = "inherit" | "current" | "transparent" | "black" | "white";
type pseudo = "hover:";

type nested<T extends context, Pseudo extends boolean> = Pseudo extends true ? `${pseudo}${T}-${keyof Omit<typeof TWColors, rootKeys>}-${levels}${alpha}` : `${T}-${keyof Omit<typeof TWColors, rootKeys>}-${levels}${alpha}`;

type root<T extends context, Pseudo extends boolean> = Pseudo extends true ? `${pseudo}${T}-${rootKeys}` : `${T}-${rootKeys}`;

export type TailwindColors<ctx extends context, Pseudo extends boolean> = nested<ctx, Pseudo> | root<ctx, Pseudo>;