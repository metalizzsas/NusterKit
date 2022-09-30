# Blocks

Blocks are used in the Json configuration of the machine.
Blocks have 2 pricipal types:

* ParameterBlock
* ProgramBlock

## **Parameter Blocks**

Parameter blocks are used to return values to be used in ProgramBlocks

| ParameterBlock | Returned data | require params ? | required params count |
| -------------- | ------------- | ---------------- | ----------------------|
| const | `value` as number. | ```false```| ```0``` |
| conststr | `value` as string. | ```false```| ```0``` |
| profile | Read profile field with `value` name. | ```false```| ```0``` |
| ioread | Read io gate with `value` name. | ```false```| ```0``` |
| add | Adds all params together | ```true```| ```infinite``` |
| multiply | Multiply all parameters together | ```true```| ```infinite``` |
| reverse | `params[0]` boolean opposite. | ```true```| ```1``` |
| conditional | Compares `params[0]` & `params[1]`with `value` (value can be `< > != ==`). Conditional  returns `params[2]` if true and `params[3]` if false. | ```true```| ```4```|
| variable | Read PBR variable with `value` name. Can also access PBR constants `currentStepIndex` and `currentStepRunCount`. | ```false```| ```0``` |

## **Program Blocks**

Program blocks are used to run functions

| ProgramBlock | Function | require params ? | required params count | Require Child Blocks |
| ------------ | -------- | ---------------- | ----------------------| -------------------- |
| for | will loop `params[0]`to execute child blocks | ```true```| ```1``` | ```true```|
| while | will loop `blocks` while `params[0]` compared to `params[2]` with `params[1]` operator is true. | ```true```| ```3``` | ```true```|
| if | Will compare `Params[0]` with `Params[1]` by `Params[2]` Comparator | ```true``` | ```3``` | ```true```|
| sleep | Will sleep `Params[0]` seconds | ```true```| ```1``` | ```false``` |
| iowrite | Will write `Params[1]` to `Params[0]` gate | ```true```| ```2``` | ```false``` |
| variable | Write PBR variable with `Params[0]` name to `Params[1]` value. | ```false```| ```2``` | ```false```|
| startTimer | Will start a recuring timer with `Params[0]` name and `Params[1]` repeat time in ms. | ```true```| ```2``` | ```true```|
| stopTimer | Will stop the recuring timer with `Params[0]` name. | ```true```| ```1``` | ```false```|
| group | Will execute all the blocks inside `blocks`. | ```false```| ```0``` | ```true```|