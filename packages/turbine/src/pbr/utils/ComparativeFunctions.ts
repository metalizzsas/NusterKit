import type { Comparators } from "../../types/spec/cycle/parameter";

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