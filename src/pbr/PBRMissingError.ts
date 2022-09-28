export class PBRMissingError extends Error
{
    constructor(blockName: string)
    {
        super();
        this.message = `${blockName}: Missing PBR Instance.`;
    }
}