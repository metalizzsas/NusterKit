import type { StringParameterBlocks } from "$types/spec/cycle/parameter";
import { ParameterBlock } from "./parameter-block";

export class StringParameterBlock extends ParameterBlock<string> {
	constructor(obj: StringParameterBlocks) {
		super(obj);
	}
}
