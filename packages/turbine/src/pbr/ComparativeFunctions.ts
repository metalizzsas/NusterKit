import type { Comparators } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";

export default {
    ">": (x: number, y: number) => x > y,
    "<": (x: number, y: number) => x < y,
    ">=": (x: number, y: number) => x >= y,
    "<=": (x: number, y: number) => x <= y,
    "==": (x: number, y: number) => x == y,
    "===": (x: number, y: number) => x === y,
    "!=": (x: number, y: number) => x != y,
    "!==": (x: number, y: number) => x === y
} as Record<Comparators, (x: number, y: number) => boolean>;