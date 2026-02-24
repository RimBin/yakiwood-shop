# Configurator 3D model

Place the production Blender export here as:

- `model.glb`

Current configurator route (`/konfiguratorius3d`) loads:

- `/models/configurator/model.glb`

Recommended export settings:

- Format: `glTF Binary (.glb)`
- Apply modifiers: enabled
- +Y up / meters scale (default glTF settings)
- Embed textures into `.glb` (or ensure external textures are copied and paths resolved)

Behavior in app:

- If `model.glb` exists, it is rendered in the 3D canvas.
- If missing, configurator automatically falls back to the existing procedural preview model.
