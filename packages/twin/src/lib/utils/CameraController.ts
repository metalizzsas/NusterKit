import { Group, Quaternion, Raycaster, Vector3, type Camera } from "three";
import { clamp } from "three/src/math/MathUtils";
import { InputController } from "./InputController";

type CameraControllerOptions = {
    cameraSpeed: number;
    verticalMaxAngle: number;
    verticalMinAngle: number;
}

export class CameraController
{
    private camera: Camera;
    private inputController: InputController;

    private rotation: Quaternion;
    private translation: Vector3;
    private pitch: number;
    private yaw: number;

    private options: CameraControllerOptions

    private raycaster: Raycaster = new Raycaster();

    constructor(camera: Camera, options?: Partial<CameraControllerOptions>)
    {
        this.camera = camera;
        this.inputController = new InputController();

        this.rotation = new Quaternion();
        this.translation = new Vector3(10, 10, 10);
        this.pitch = 0;
        this.yaw = 0;

        this.options = {...{
            cameraSpeed: 5,
            verticalMaxAngle: Math.PI / 3,
            verticalMinAngle: -Math.PI / 3
        }, ...{options}};
    }

    updateMouseLock(state: boolean)
    {
        this.inputController.updateMouseLockState(state);
    }

    update(delta: number)
    {
        this.updateRotation(delta);
        this.updateTranslation(delta);
        this.updateCamera(delta);

    }
    
    updateRaycast(blockGroup: Group): Vector3 | undefined
    {
        this.raycaster.setFromCamera({ x: 0, y: 0}, this.camera);    
        const obj = this.raycaster.intersectObjects(blockGroup.children);

        return obj.at(0)?.object.parent?.position;
    }

    private updateCamera(delta: number)
    {
        this.camera.quaternion.copy(this.rotation);
        this.camera.position.copy(this.translation);
    }

    private updateRotation(delta: number)
    {
        const xTraveled = this.inputController.mouseDelta.x / window.innerWidth;
        const yTraveled = this.inputController.mouseDelta.y / window.innerHeight;

        this.pitch += -xTraveled * this.options.cameraSpeed;
        this.yaw = clamp(this.yaw + -yTraveled * this.options.cameraSpeed, this.options.verticalMinAngle, this.options.verticalMaxAngle);

        const rotationX = new Quaternion();
        rotationX.setFromAxisAngle(new Vector3(0, 1, 0), this.pitch);

        const rotationY = new Quaternion();
        rotationY.setFromAxisAngle(new Vector3(1, 0, 0), this.yaw);

        const totalRotation = new Quaternion();
        totalRotation.multiply(rotationX);
        totalRotation.multiply(rotationY);

        this.rotation.copy(totalRotation);
    }

    private updateTranslation(delta: number)
    {
        const xVelocity = (this.inputController.keyboard.forward ? 1 : 0) + (this.inputController.keyboard.backward ? -1 : 0);
        const yVelocity = (this.inputController.keyboard.upward ? 1 : 0) + (this.inputController.keyboard.sneak ? -1 : 0);
        const zVelocity = (this.inputController.keyboard.left ? 1 : 0) + (this.inputController.keyboard.right ? -1 : 0);

        const orientation = new Quaternion();

        orientation.setFromAxisAngle(new Vector3(0, 1, 0), this.pitch);

        const forwardDistance = new Vector3(0, 0, -1);
        forwardDistance.applyQuaternion(orientation);
        forwardDistance.multiplyScalar(xVelocity * delta * 10);

        const leftDistance = new Vector3(-1, 0, 0);
        leftDistance.applyQuaternion(orientation);
        leftDistance.multiplyScalar(zVelocity * delta * 10);

        const upwardDistance = new Vector3(0, 1, 0);
        //upwardDistance.applyQuaternion(orientation);
        upwardDistance.multiplyScalar(yVelocity * delta * 10);


        this.translation.add(forwardDistance);
        this.translation.add(leftDistance);
        this.translation.add(upwardDistance);
    }
}