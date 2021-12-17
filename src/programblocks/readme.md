# Blocks

Blocks are used in the Json configuration of the machine.
Blocks have 2 pricipal types:

* ParameterBlock
* ProgramBlock

## **Parameter Blocks**

Parameter blocks are used to return values to be used in ProgramBlocks

### **String constant**

Returned data: `value field`

### **Numeric constant**

Returned data: `value field`

### **Profile**

returned data: `profile field value`

### **IO Read**

value: `gateName`

returned data: `gate value`

### **Add operation**

Parameters:

* Value X
* Value Y

Returned data: `X + Y`

### **Multiply operation**

Parameters:

* Value X
* Value Y

Returned data: `X * Y`

### **Reverse operation**

Parameters:

* Value X

Returned data: `(X == 1)`

## **Program Blocks**

Program blocks are used to run functions

### **For Loop**

Parameters:

* Loop counter `number`

Blocks:

* Array of ProgramBlock

### **If Statement**

Parameters:

* X
* string: `> or < or == or !=`
* Y

Blocks:

* Block 1 executed if Statement is true
* Block 2 executed if statement is false

### **Sleep**

Parameters:

* X: number of seconds to wait for

Blocks: Empty array

### **IOWrite**

Parameters:

* gateName: string gate to write on
* gateValue: Value to write, should be a number

Blocks: Empty array
