/** Base `IOGate` */
interface IOGate
{
    /** Gate name */
    name: string;
    
    /** Gate controller data size */
    size: "bit" | "word";
    /** Gate bus */
    bus: "in" | "out";
    /** Gate type */
    type: "default" | "mapped" | "pt100";
    
    /** Automaton where this gate is available */
    controllerId: number;
    /** Address on the automaton address range */
    address: number;
    
    /** Default value of this gate */
    default: number;
    
    /** Unity used by this gate */
    unity?: string;
}

/** `DefaultGate`: base gate with no special computation needed. */
interface DefaultGate extends IOGate
{
    type: "default";
}

/** `MappedGate`: will map value in range In to out range. */
interface MappedGate extends IOGate
{
    type: "mapped";
    /** Size is always a word for this typoe of Gate */
    size: "word";

    /** Mapped output min data, to Human */
    mapOutMin: number;
    
    /** Mapped output max data, to Human */
    mapOutMax: number;

    /** 
     * Mapped input min data, from IO Controller
     * @defaultValue 0
     */
    mapInMin?: number;
    /** 
     * Mapped input max data, from IOController
     * @defaultValue 32767
     */
    mapInMax?: number;
}

/** `PT100`: Temperature gate. */
interface PT100Gate extends IOGate
{
    type: "pt100",
    size: "word",
    unity: "°C",
    bus: "in"
}

/** Available Spec gates */
type IOGates = (DefaultGate | MappedGate | PT100Gate) & IOGate;

/** Base IOGate Class implementation */
interface IOGateBase extends IOGate
{
    category: string;
    value: number;

    locked: boolean;

    /** Reads the value of the gate */
    read(ignoreValueAssignement?: boolean): Promise<boolean | number>
    
    /** 
     * Writes data to the gate
     * @param data Data to write to the gate
     */
    write(data: number, ignoreValueAssignement?: boolean): Promise<boolean>
}

export { IOGateBase, IOGates, DefaultGate, MappedGate, PT100Gate };