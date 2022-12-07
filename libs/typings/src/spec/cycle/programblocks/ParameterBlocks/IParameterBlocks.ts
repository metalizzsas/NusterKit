
// Math parameter blocks

export type AddParameterBlock = {"add": Array<NumericParameterBlocks>};
export type MultiplyParameterBlock = {"multiply": Array<NumericParameterBlocks>};
export type ReverseParameterBlock = {"reverse": NumericParameterBlocks};

// Constant parameter blocks

export type ConstantParameterBlock = {"number": number};
export type StringParameterBlock = {"string": string};

// Computed parameter blocks

export type ConditionalParameterBlock = {"conditional": ["==" | "!=" | ">" | "<" | ">=" | "=<", NumericParameterBlocks, NumericParameterBlocks, NumericParameterBlocks, NumericParameterBlocks]};
export type IOReadParameterBlock = {"io_read": StringParameterBlocks};
export type ProfileParameterBlock = {"profile": StringParameterBlocks};
export type VariableParameterBlock = {"variable": StringParameterBlocks};

// Status parameter blocks

export type MaintenanceParameterBlock = {"maintenance": StringParameterBlock};
export type SlotProductStatusParameterBlock = {"slot": StringParameterBlock};


// Parameter Blocks Groups

export type StatusParameterBlocks = MaintenanceParameterBlock | SlotProductStatusParameterBlock;
export type StringParameterBlocks = StringParameterBlock | string;
export type NumericParameterBlocks = AddParameterBlock | MultiplyParameterBlock | ConditionalParameterBlock | ConstantParameterBlock | IOReadParameterBlock | ProfileParameterBlock | number ;
