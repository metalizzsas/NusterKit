/**
 * @file Parameter Blocks definitions
 * @author @kworz
 * @description here are all the Parameter blocks definitions, they can be used in the machine specs.json file to define cycles.
 */

// Math parameter blocks

// Unlimited args
export type AddParameterBlock = {"add": Array<NumericParameterBlocks>};
export type MultiplyParameterBlock = {"multiply": Array<NumericParameterBlocks>};

// Limited args
export type SubParameterBlock = {"sub": [NumericParameterBlocks, NumericParameterBlocks]};
export type DivideParameterBlock = {"divide": [NumericParameterBlocks, NumericParameterBlocks]}
export type ReverseParameterBlock = {"reverse": NumericParameterBlocks};

// Constant parameter blocks

export type NumberParameterBlock = {"number": number};
export type StringParameterBlock = {"string": string};

// Computed parameter blocks

export type Comparators = "==" | "===" | "!=" | "!==" | ">" | "<" | ">=" | "<=";

export type ConditionalParameterBlock = {"conditional": {
        "comparison": [NumericParameterBlocks, Comparators, NumericParameterBlocks],

        "value_if_true": NumericParameterBlocks,
        "value_if_false": NumericParameterBlocks
    }
};
export type IOReadParameterBlock = {"io_read": StringParameterBlocks};
export type ProfileParameterBlock = {"profile": StringParameterBlocks};
export type ReadVariableParameterBlock = {"read_var": StringParameterBlocks};
export type ReadMachineVariableParameterBlock = {"read_machine_var": StringParameterBlocks};

// Container

export type GetRegulationStateParameterBlock = { "get_regulation_state": { "container": StringParameterBlocks, "regulation": StringParameterBlocks }};

// Status parameter blocks

export type MaintenanceStatusParameterBlock = {"maintenance_status": StringParameterBlocks | [StringParameterBlocks, NumericParameterBlocks]};
export type ProductStatusParameterBlock = {"product_status": StringParameterBlocks};

// Parameter Blocks Groups

export type StatusParameterBlocks = MaintenanceStatusParameterBlock | ProductStatusParameterBlock;
export type StringParameterBlocks = StringParameterBlock | string;
export type NumericParameterBlocks = AddParameterBlock | SubParameterBlock | MultiplyParameterBlock | DivideParameterBlock | ReverseParameterBlock | ConditionalParameterBlock | NumberParameterBlock | IOReadParameterBlock | ProfileParameterBlock | ReadVariableParameterBlock | ReadMachineVariableParameterBlock | GetRegulationStateParameterBlock | number ;

export type AllParameterBlocks = StatusParameterBlocks | StringParameterBlocks | NumericParameterBlocks;