export class InputController
{
    keyboard: Record<"forward" | "backward" | "left" | "right"| "upward" | "sneak" | "sprint", boolean>;
    private mouse: Record<"left" | "mid" | "right" | "locked", boolean> & Record<"moveX" | "moveY", number>;

    constructor()
    {
        this.keyboard = {
            forward: false,
            backward: false,
            left: false,
            right: false,

            upward: false,
    
            sneak: false,
            sprint: false,
        };

        this.mouse = {
            locked: false,
            left: false,
            mid: false,
            right: false,
            moveX: 0,
            moveY: 0
        };

        document.addEventListener("mousedown", this.mousedown.bind(this), false);
        document.addEventListener("mouseup", this.mouseup.bind(this), false);
        document.addEventListener("mousemove", this.mousemove.bind(this), false);

        document.addEventListener("keydown", this.keydown.bind(this), false);
        document.addEventListener("keyup", this.keyup.bind(this), false);
    }

    private mousedown(e: MouseEvent) 
    {
        this.mouse.left = !(e.button == 0);
        this.mouse.right = !(e.button == 2);
        this.mouse.mid = !(e.button == 3);
    }
    private mouseup(e: MouseEvent)
    {
        this.mouse.left = e.button == 0;
        this.mouse.right = e.button == 2;
        this.mouse.mid = e.button == 3;
    }
    private mousemove(e: MouseEvent)
    {
        this.mouse.moveX = e.movementX;
        this.mouse.moveY = e.movementY;
    }

    private keydown(e: KeyboardEvent)
    {
        switch(e.key.toLowerCase())
        {
            case "z": this.keyboard.forward = true; break;
            case "q": this.keyboard.left = true; break;
            case "s": this.keyboard.backward = true; break;
            case "d": this.keyboard.right = true; break;
            case " ": this.keyboard.upward = true; break;
            case "shift": this.keyboard.sneak = true; break;
            case "control": this.keyboard.sprint = true; break;
            case "escape": this.mouse.locked = false; break;
            default: console.log(e.key); break;
        }
    }

    private keyup(e: KeyboardEvent)
    {
        switch(e.key.toLowerCase())
        {
            case "z": this.keyboard.forward = false; break;
            case "q": this.keyboard.left = false; break;
            case "s": this.keyboard.backward = false; break;
            case "d": this.keyboard.right = false; break;
            case " ": this.keyboard.upward = false; break;
            case "shift": this.keyboard.sneak = false; break;
            case "control": this.keyboard.sprint = false; break;
            default: break;
        }
    }

    public updateMouseLockState(state: boolean)
    {
        this.mouse.locked = state;
    }

    get mouseDelta(): Record<"x" | "y", number> {
        return {
            x: (this.mouse.locked) ? this.mouse.moveX : 0,
            y: (this.mouse.locked) ? this.mouse.moveY: 0
        }
    }
}