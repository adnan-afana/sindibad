/** Owner-mode overrides, stored in this browser only (IndexedDB). */
import type { Adjust } from '../data/types'

export interface OwnerState { active: boolean; adjust: Record<string, Adjust>; images: Record<string, Blob> }

const DB = 'sindibad-owner'
const STORE = 'kv'

export const emptyOwnerState = (): OwnerState => ({ active: false, adjust: {}, images: {} })
export const noAdjust: Adjust = { scale: 1, x: 0, y: 0, rotation: 0 }

export const foodKey = (dish: string) => `food:${dish}`
export const baseKey = (dish: string) => `base:${dish}`
export const referenceKey = (dish: string) => `reference:${dish}`

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function loadOwnerState(): Promise<OwnerState> {
  try {
    // Some in-app/embedded browsers never answer IndexedDB requests: give up quickly.
    const timeout = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 700))
    const v = await Promise.race([run<OwnerState | undefined>('readonly', (s) => s.get('state')), timeout])
    return v ? { ...emptyOwnerState(), ...v } : emptyOwnerState()
  } catch {
    return emptyOwnerState()
  }
}

export async function saveOwnerState(state: OwnerState): Promise<boolean> {
  try {
    await run('readwrite', (s) => s.put(state, 'state'))
    return true
  } catch {
    return false
  }
}

const toDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(b)
  })

function fromDataUrl(url: string): Blob {
  const [head, body] = url.split(',')
  const type = /data:([^;]+)/.exec(head)?.[1] ?? 'application/octet-stream'
  const bin = atob(body)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type })
}

export async function exportOwnerState(state: OwnerState) {
  const images: Record<string, string> = {}
  for (const [k, v] of Object.entries(state.images)) images[k] = await toDataUrl(v)
  return { kind: 'sindibad-owner-config', version: 1, adjust: state.adjust, images }
}

export function importOwnerState(text: string, current: OwnerState): OwnerState {
  const data = JSON.parse(text)
  if (data.kind !== 'sindibad-owner-config') throw new Error('This file is not a Sindibad owner configuration.')
  const images: Record<string, Blob> = {}
  for (const [k, v] of Object.entries((data.images ?? {}) as Record<string, string>)) images[k] = fromDataUrl(v)
  return { active: current.active, adjust: data.adjust ?? {}, images }
}

/** CSS transform for an owner adjustment, or undefined when it is the identity. */
export function adjustTransform(a: Adjust = noAdjust) {
  if (a.scale !== 1 || a.x || a.y || a.rotation)
    return `translate(${a.x * 100}%, ${a.y * 100}%) rotate(${a.rotation}deg) scale(${a.scale})`
  return undefined
}

/** Edits published with the site: public/assets/owner/site-images.json (+ the image files beside it). */
export interface Published { adjust: Record<string, Adjust>; images: Record<string, string> }
export const PUBLISHED_DIR = 'assets/owner/'
export async function loadPublished(): Promise<Published> {
  try {
    const r = await fetch(PUBLISHED_DIR + 'site-images.json', { cache: 'no-cache' })
    if (!r.ok) return { adjust: {}, images: {} }
    const d = await r.json()
    const images: Record<string, string> = {}
    for (const [k, f] of Object.entries((d.images ?? {}) as Record<string, string>)) images[k] = PUBLISHED_DIR + f
    return { adjust: d.adjust ?? {}, images }
  } catch {
    return { adjust: {}, images: {} }
  }
}
const extFor = (b: Blob) => ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif' } as Record<string, string>)[b.type] ?? 'png'
/** ZIP with site-images.json + the new image files, to drop into public/assets/owner/ on GitHub. */
export async function publishBundle(state: OwnerState, published: Published) {
  const { makeZip } = await import('./zip')
  const stamp = Date.now().toString(36)
  const files: { name: string; data: Blob | string }[] = []
  const images: Record<string, string> = {}
  for (const [k, p] of Object.entries(published.images)) if (!k.startsWith('reference:')) images[k] = p.slice(PUBLISHED_DIR.length)
  for (const [k, b] of Object.entries(state.images)) {
    if (k.startsWith('reference:')) continue
    const name = `${k.replace(':', '-')}-${stamp}.${extFor(b)}`
    images[k] = name
    files.push({ name, data: b })
  }
  const adjust = { ...published.adjust, ...state.adjust }
  files.unshift({ name: 'site-images.json', data: JSON.stringify({ kind: 'sindibad-site-images', version: 1, adjust, images }, null, 2) })
  return makeZip(files)
}
