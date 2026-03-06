# Product 3D Models

Place per-product `.glb` files here. Each product can have its own model.

## Naming Convention

| Product | GLB File |
|---------|----------|
| Shou Sugi Ban eglė fasadui | (TODO) `spruce-facade.glb` — currently maps to `spruce-terrace*.glb` |
| Shou Sugi Ban eglė terasai | `spruce-terrace.glb` |
| Shou Sugi Ban maumedis fasadui | (TODO) `larch-facade.glb` — currently maps to `larch-terrace*.glb` |
| Shou Sugi Ban maumedis terasai | `larch-terrace.glb` |

## Blender Export Settings

Export each product as **glTF Binary (.glb)** with:

- **Apply Modifiers**: ON
- **Export only selected**: Select only the specific product objects
- **Materials**: Use **one material** per mesh (Principled BSDF). The code will dynamically change `color`, `roughness`, and `metalness` based on user selection — no need for separate materials per color
- **Geometry**: Draco compression ON (smaller file size)
- **Transform**: +Y Up, -Z Forward (Three.js standard)
- **Target polycount**: ~50k triangles per model (mobile optimization)

## Material Setup in Blender

Each mesh should have a single **Principled BSDF** material. The website code traverses all meshes and applies:

- `material.color.set(hex)` — changes color based on user-selected swatch
- `material.roughness` — set from finish preset (matte: 0.86, semi: 0.62, gloss: 0.42)
- `material.metalness` — set from finish preset (matte: 0.04, semi: 0.08, gloss: 0.12)

So UV-mapping and base geometry are important, but material colors/roughness will be overridden at runtime.

## How It Works

The model registry is in `lib/models.ts`. It maps product slugs to GLB file paths.
When a product slug has no specific model, it falls back to `/models/configurator/model.glb` (generic model).
If no model file exists, the configurator shows a procedural 3D shape.
