# Version **1.4.0**

- PBR: Migrated watchdog to start conditions
- PBR: Can now start a cycle with a profile given by `POST:/v1/cycle/` body
- ProgramBlocks: Added `SlotLoad` & `SlotUnload` Program blocks
- ParameterBlocks: Added `SlotLifetime`, `SlotProductStatus`& `MaintenanceProgress` parameter blocks, they should be used on start conditions
- Slots: Redone slots logic
- Slots: If slots is productable and low level sensor is reached, product is unloaded
- Interfaces: Interfaces parameters are now logic for JSON Schema generation
