"""Prepare the CC BY All Seeing Eye scene for the Aether website.

Run with Blender:
  blender --background <AllSeeing.blend> --python scripts/process-eye.py -- \
    <output.glb> <poster.png>

The source .blend remains untouched. This script removes the original ocean
environment, remaps the materials to Aether's palette, writes attribution into
the exported glTF extras, and renders the static fallback poster.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


EYE_OBJECTS = {
    "11010101",
    "0101010111",
    "000111",
    "0010111010",
    "1.001",
    "1.0110",
    "1",
}


def hex_rgba(value: str) -> tuple[float, float, float, float]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)) + (1.0,)


def look_at(obj: bpy.types.Object, target: Vector) -> None:
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def material(name: str, color: str, *, emission: str | None = None, strength: float = 0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Base Color"].default_value = hex_rgba(color)
    shader.inputs["Metallic"].default_value = 0.72
    shader.inputs["Roughness"].default_value = 0.28
    if emission:
        shader.inputs["Emission Color"].default_value = hex_rgba(emission)
        shader.inputs["Emission Strength"].default_value = strength
    mat.node_tree.links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return mat


def prepare_scene() -> list[bpy.types.Object]:
    selected: list[bpy.types.Object] = []
    for obj in list(bpy.context.scene.objects):
        if obj.name in EYE_OBJECTS:
            selected.append(obj)
        else:
            bpy.data.objects.remove(obj, do_unlink=True)

    graphite = material("Aether Graphite", "#14110f")
    rust = material("Aether Signal", "#4f1713", emission="#cf3f32", strength=3.8)
    amber = material("Aether Ember", "#4a3312", emission="#e5b94b", strength=2.6)

    for obj in selected:
        if obj.type != "MESH":
            continue
        if obj.name in {"0101010111", "000111", "0010111010"}:
            # These three linked globe layers dominate the rendered triangle
            # count. A restrained reduction keeps the silhouette intact while
            # bringing the assembled hero below the ~100k triangle budget.
            bpy.context.view_layer.objects.active = obj
            obj.select_set(True)
            decimate = obj.modifiers.new("Aether Web Decimation", "DECIMATE")
            decimate.ratio = 0.88
            bpy.ops.object.modifier_apply(modifier=decimate.name)
            obj.select_set(False)
        obj.data.materials.clear()
        if obj.name in {"0101010111", "000111", "0010111010"}:
            obj.data.materials.append(rust)
        elif obj.name in {"1", "1.001", "1.0110"}:
            obj.data.materials.append(amber)
        else:
            obj.data.materials.append(graphite)

    root = bpy.data.objects.new("Aether_All_Seeing_Eye", None)
    bpy.context.scene.collection.objects.link(root)
    root["title"] = "The All Seeing Eye"
    root["creator"] = "The WarVet"
    root["source"] = "https://sketchfab.com/3d-models/the-all-seeing-eye-eba076cbdee94f2f9d399d95267f6ade"
    root["license"] = "CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/"
    root["changes"] = "Environment removed; geometry selected; materials and lighting adapted; exported to glTF for Aether."
    for obj in selected:
        world = obj.matrix_world.copy()
        obj.parent = root
        obj.matrix_world = world
    selected.append(root)
    return selected


def add_light(name: str, kind: str, color: str, energy: float, location: tuple[float, float, float], size: float = 5):
    data = bpy.data.lights.new(name, kind)
    data.color = hex_rgba(color)[:3]
    data.energy = energy
    if kind == "AREA":
        data.shape = "DISK"
        data.size = size
    light = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(light)
    light.location = location
    look_at(light, Vector((0, 0, 20)))
    return light


def render_poster(output: Path) -> None:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1120
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.filepath = str(output)
    scene.render.image_settings.color_mode = "RGBA"

    camera_data = bpy.data.cameras.new("Aether Camera")
    camera_data.lens = 62
    camera = bpy.data.objects.new("Aether Camera", camera_data)
    bpy.context.scene.collection.objects.link(camera)
    camera.location = (7.5, -13.5, 23.5)
    look_at(camera, Vector((0, 0, 21.0)))
    scene.camera = camera

    add_light("Rust Rim", "AREA", "#cf3f32", 1150, (-8, -7, 28), 8)
    add_light("Amber Key", "AREA", "#e5b94b", 1250, (10, -10, 24), 7)
    add_light("Bone Fill", "AREA", "#e9e2d4", 800, (2, 8, 18), 9)

    world = scene.world or bpy.data.worlds.new("Aether World")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = hex_rgba("#0a0807")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.08

    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)


def export_glb(objects: list[bpy.types.Object], output: Path) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[-1]
    output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(output),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_extras=True,
        export_lights=False,
        export_cameras=False,
        export_animations=False,
        export_meshopt_compression_enable=True,
        export_meshopt_extension="EXT_meshopt_compression",
    )


def main() -> None:
    try:
        marker = sys.argv.index("--")
        glb_path = Path(sys.argv[marker + 1]).resolve()
        poster_path = Path(sys.argv[marker + 2]).resolve()
    except (ValueError, IndexError) as exc:
        raise SystemExit("Expected: -- <output.glb> <poster.png>") from exc

    objects = prepare_scene()
    render_poster(poster_path)
    export_glb(objects, glb_path)
    print(f"Wrote {glb_path}")
    print(f"Wrote {poster_path}")


if __name__ == "__main__":
    main()
