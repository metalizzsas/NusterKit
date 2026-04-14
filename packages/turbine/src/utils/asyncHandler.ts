import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler so that rejections are forwarded to next().
 * Without this, an unhandled rejection in an async handler leaves the response hanging.
 */
export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction): void => {
	fn(req, res, next).catch(next);
};
