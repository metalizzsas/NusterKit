import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler so that rejections are forwarded to next().
 * Without this, an unhandled rejection in an async handler leaves the response hanging.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asyncHandler = <Req extends Request = any>(
	fn: (req: Req, res: Response, next: NextFunction) => Promise<void>
) => (req: Req, res: Response, next: NextFunction): void => {
	fn(req, res, next).catch(next);
};
