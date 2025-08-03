// main.js
import * as THREE from "./node_modules/three/build/three.module.js";
import { GLTFExporter } from "./node_modules/three/examples/jsm/exporters/GLTFExporter.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 2;

const status = document.getElementById("status");
status.textContent = "waiting for image";

function removeGLTF() {
    localStorage.removeItem("gltfModel");
    alert("gltfModel removed from localStorage.");
}

document.getElementById("upload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const status = document.getElementById("status");
    status.textContent = "Loading image...";

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = new Image();

        image.onload = function () {
            const texture = new THREE.Texture(image);
            texture.needsUpdate = true;

            const aspect = image.width / image.height;
            const width = 1;
            const height = 1 / aspect;

            const geometry = new THREE.PlaneGeometry(width, height);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
            });

            const plane = new THREE.Mesh(geometry, material);
            plane.rotation.x = Math.PI / 2; // lay flat
            //plane.rotation.z = Math.PI; // flip front face upward
            //plane.rotation.y = Math.PI; // flip front face upward
            //plane.position.y = 0;
            scene.clear();
            scene.add(plane);

            const exporter = new GLTFExporter();
            const exportAsGLB = false;

            exporter.parse(
                scene,
                (result) => {
                    let output, mime, extension;
                    if (exportAsGLB) {
                        output = result;
                        mime = "application/octet-stream";
                        extension = "glb";
                    } else {
                        output = JSON.stringify(result, null, 2);
                        mime = "application/json";
                        extension = "gltf";
                    }
                    const reader = new FileReader();
                    reader.onload = function (output) {
                        localStorage.setItem("gltfModel", output.target.result);
                    };
                    const blob = new Blob([output], { type: mime });
                    reader.readAsText(blob); // since it's JSON
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "image-plane." + extension;
                    a.click();
                    URL.revokeObjectURL(url);

                    status.textContent = `✅ Exported as image-plane.${extension}`;
                },
                { binary: exportAsGLB }
            );
        };

        image.onerror = () => {
            status.textContent = "❌ Failed to load image.";
        };

        image.src = e.target.result;
    };

    reader.onerror = () => {
        status.textContent = "❌ Failed to read file.";
    };

    reader.readAsDataURL(file);
});