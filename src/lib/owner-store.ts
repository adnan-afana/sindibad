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
    const v = await run<OwnerState | undefined>('readonly', (s) => s.get('state'))
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
