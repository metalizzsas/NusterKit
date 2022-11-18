import type { ConfigType } from "./ConfigTypes";
import type { IStatusMessage } from "@metalizzsas/nuster-typings/build/hydrated/";
import { Box3, Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3, type Group } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import * as USCleanerConfig from "$lib/utils/configs/uscleaner.json";
import * as MetalfogConfig from "$lib/utils/configs/metalfog.json";

const models: Record<"uscleaner" | "metalfog", {config: ConfigType, gltf: string}> = {
    "metalfog": {
        config: MetalfogConfig,
        gltf: "/3D/metalfog/metalfog.gltf"
    },
    "uscleaner": {
        config: USCleanerConfig,
        gltf: "/3D/uscleaner/uscleaner.gltf"
    }
};

export class Model
{
    modelConfig: ConfigType;
    modelGltf: string;

    private gltfGroup: Group | undefined;

    constructor(model: "uscleaner" | "metalfog")
    {
        this.modelConfig = models[model].config;
        this.modelGltf = models[model].gltf;
    }

    public loadModel(): Promise<Group>
    {
        const loader = new GLTFLoader();

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
        loader.setDRACOLoader( dracoLoader );

        return new Promise<Group>((resolve, reject) => {
            loader.load(this.modelGltf, (gltf) => {

                this.gltfGroup = gltf.scene;
                this.gltfGroup.scale.set(10, 10, 10);

                const boundingBox = new Box3().setFromObject(this.gltfGroup);
                const size = new Vector3();

                boundingBox.getSize(size);
                
                this.gltfGroup.translateX(-boundingBox.min.x - (size.x / 2));
                this.gltfGroup.translateY(-boundingBox.min.y);
                this.gltfGroup.translateZ(-boundingBox.min.z - (size.z / 2));
                

                this.gltfGroup.traverse((o) => {

                    if(o instanceof Mesh)
                    {							
                        o.receiveShadow = true;
                        o.castShadow = true;
                        o.material = new MeshStandardMaterial({ color: 0x777777, roughness: 1 });
                    }
                });

                // Hiding meshes that should be hidden
                this.gltfGroup.traverse(o => {
                    if(this.modelConfig.meshesHidden.includes(o.name))
                    {
                        const newMat = new MeshBasicMaterial({ visible: false });

                        if(o instanceof Mesh)
                            o.material = newMat;
                        
                        o.traverse(o2 => {
                            if(o2 instanceof Mesh)
                                o2.material = newMat;
                        });
                    }
                });

                //Add custom materials to meshss that needs it

                const hasCustomMaterialList = this.modelConfig.meshesWithMaterial.flatMap(k => k.meshes);

                this.gltfGroup.traverse(o => {
                    if(hasCustomMaterialList.includes(o.name))
                    {
                        const material = this.modelConfig.meshesWithMaterial.find(k => k.meshes.includes(o.name))?.material;
                        o.traverse(o2 => {
                            if(material && o2 instanceof Mesh)
                                o2.material = new MeshStandardMaterial(material);
                        });

                    }
                });

                resolve(this.gltfGroup);

            }, (xhr) => { console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded'); }, (error: ErrorEvent) => { console.log(error.message); reject(); });
        });
    }

    public updateModel(data: IStatusMessage | undefined)
    {
        if(data === undefined || this.gltfGroup === undefined)
            return;
        
        for(const reactiveStatement of this.modelConfig.meshesReactive)
        {
            const reactiveParam = data.io.find(p => p.name == reactiveStatement.value);

            if(reactiveParam === undefined)
                continue;
            
            this.gltfGroup?.traverse(o => {
                if(o.name.includes(reactiveStatement.meshName))
                {
                    o.traverse(o2 => {
                        if(o2 instanceof Mesh && o2.material instanceof MeshStandardMaterial)
                        {
                            o2.material.color = new Color(reactiveParam.value > 0 ? 0x028A0F : 0xFF0000);
                        }
                    })
                }
            });
        }
    }
}