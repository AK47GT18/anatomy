/**
 * Shared singleton GLTFLoader + DRACOLoader with URL-keyed scene cache.
 *
 * WHY: Each system component previously created its own GLTFLoader and
 * DRACOLoader pair, triggering a fresh DRACO wasm download and parse on
 * every mount. With 15 GLBs spanning 52 MB this caused 15 simultaneous
 * network requests + 15 WASM instantiations, all on page load.
 *
 * HOW: One loader pair is created lazily (browser-only). Every load call
 * goes through the same loader (DRACO wasm loaded once). Results are
 * cached in `sceneCache` keyed by URL — if a model has already been
 * loaded, the cached clone is returned immediately without re-parsing.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Local DRACO decoder (copied to public/draco/ to avoid CDN round-trips)
const DRACO_LOCAL = '/draco/';

let _loader: GLTFLoader | null = null;
let _draco: DRACOLoader | null = null;

/** Returns the shared singleton GLTFLoader, creating it once on first call. */
function getLoader(): GLTFLoader {
  if (_loader) return _loader;

  _draco = new DRACOLoader();
  _draco.setDecoderPath(DRACO_LOCAL);
  _draco.preload(); // start DRACO wasm fetch immediately in background

  _loader = new GLTFLoader();
  _loader.setDRACOLoader(_draco);

  return _loader;
}

/** URL → cloned THREE.Group cache so each model is decoded at most once. */
const sceneCache = new Map<string, THREE.Group>();

/** Pending promises — prevents duplicate in-flight fetches for the same URL. */
const inflight = new Map<string, Promise<THREE.Group>>();

/**
 * Load a GLB, returning a **clone** of the cached scene graph.
 * Cloning is cheap (references shared geometries/materials) but gives
 * each consumer an independent transform hierarchy.
 *
 * @param url   Path relative to `public/` e.g. `/models/heart.glb`
 * @param onProgress  Optional XHR progress callback
 */
export function loadGLB(
  url: string,
  onProgress?: (pct: number) => void
): Promise<THREE.Group> {
  // Return a clone of the already-parsed scene if available
  if (sceneCache.has(url)) {
    return Promise.resolve(sceneCache.get(url)!.clone(true));
  }

  // Deduplicate in-flight requests
  if (inflight.has(url)) {
    return inflight.get(url)!.then((root) => root.clone(true));
  }

  const loader = getLoader();

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const root = gltf.scene;
        // Store original in cache, return a clone to the caller
        sceneCache.set(url, root);
        inflight.delete(url);
        resolve(root.clone(true));
      },
      onProgress
        ? (xhr) => {
            if (xhr.lengthComputable) {
              onProgress(Math.round((xhr.loaded / xhr.total) * 100));
            }
          }
        : undefined,
      (err) => {
        inflight.delete(url);
        reject(err);
      }
    );
  });

  inflight.set(url, promise);
  return promise;
}

/**
 * Kick off a background fetch of a GLB so it's warm in the cache
 * before the component that needs it mounts. Fire-and-forget — errors
 * are silently swallowed because the actual load will retry.
 */
export function preloadGLB(url: string): void {
  if (sceneCache.has(url) || inflight.has(url)) return;
  loadGLB(url).catch(() => {});
}

/** Clear a specific URL from cache (call when permanently unneeded). */
export function evictGLB(url: string): void {
  const scene = sceneCache.get(url);
  if (scene) {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).geometry.dispose();
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
    });
    sceneCache.delete(url);
  }
}
