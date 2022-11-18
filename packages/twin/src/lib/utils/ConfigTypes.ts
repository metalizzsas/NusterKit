import type { MeshStandardMaterialParameters } from "three"

export type ConfigType = {
    meshesHidden: string[],

    meshesWithMaterial: {
        material: MeshStandardMaterialParameters,
        meshes: string[]
    }[],

    meshesReactive: {
        meshName: string,
        type: string,
        value: string
    }[]
} 