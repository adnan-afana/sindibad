import { useEffect, useMemo, useState } from 'react'
import type { Adjust, DishId } from '../data/types'
import {
  adjustTransform, baseKey, emptyOwnerState, exportOwnerState, foodKey, importOwnerState, loadOwnerState,
  noAdjust, referenceKey, saveOwnerState, type OwnerState,
  loadPublished, publishBundle, type Published,
} from '../lib/owner-store'
import { dishes, food, grillLayout, landedStyle, moversFor, pieceStyle, scenePieces, type SceneModel } from '../lib/scene-model'

const SLIDERS: { prop: keyof Adjust; label: string; min: number; max: number; step: number; unit: string; scale: number }[] = [
  { prop: 'scale', label: 'Scale', min: 0.5, max: 1.5, step: 0.01, unit: '%', scale: 100 },
  { prop: 'x', label: 'Horizontal', min: -0.3, max: 0.3, step: 0.005, unit: '%', scale: 100 },
  { prop: 'y', label: 'Vertical', min: -0.3, max: 0.3, step: 0.005, unit: '%', scale: 100 },
  { prop: 'rotation', label: 'Rotation', min: -45, max: 45, step: 0.5, unit: '°', scale: 1 },
]

/** Owner mode (#owner): replace food/dish images and fine-tune them, stored in this browser only. */
export default function OwnerEditor() {
  const [state, setState] = useState<OwnerState>(emptyOwnerState)
  const [dish, setDish] = useState<DishId>(dishes[0]?.id ?? 'chicken')
  const [compare, setCompare] = useState(0)
  const [message, setMessage] = useState('')
  const [exported, setExported] = useState('')

  const [published, setPublished] = useState<Published>({ adjust: {}, images: {} })
  useEffect(() => {
    loadPublished().then((pub) => {
      setPublished(pub)
      loadOwnerState().then((st) => setState({ ...st, adjust: { ...pub.adjust, ...st.adjust } }))
    })
  }, [])

  const urls = useMemo(
    () => Object.fromEntries(Object.entries(state.images).map(([k, b]) => [k, URL.createObjectURL(b)])),
    [state.images],
  )
  useEffect(() => () => Object.values(urls).forEach((u) => URL.revokeObjectURL(u)), [urls])

  const allUrls = { ...published.images, ...urls }
  const model: SceneModel = { local: { images: allUrls, adjust: state.adjust } }
  const plate = food.plates[dish]
  const dishInfo = dishes.find((d) => d.id === dish)
  const first = moversFor(dish)[0]

  const save = async (next: OwnerState, done = '') => {
    setState(next)
    const ok = await saveOwnerState(next)
    setMessage(ok ? done : 'This browser is not allowing saves (private window or blocked site data). Edits will be lost when you leave; export them to keep them.')
  }
  const setAdjust = (key: string, prop: keyof Adjust, value: number) =>
    save({ ...state, adjust: { ...state.adjust, [key]: { ...(state.adjust[key] ?? noAdjust), [prop]: value } } })
  const resetAdjust = (key: string) => {
    const adjust = { ...state.adjust }
    delete adjust[key]
    save({ ...state, adjust }, 'Position reset.')
  }
  const replace = (key: string, file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setMessage('Choose an image file (PNG, JPG or WebP).')
    save({ ...state, images: { ...state.images, [key]: file } }, 'Replaced. Saved in this browser only.')
  }
  const useOriginal = (key: string) => {
    const images = { ...state.images }
    delete images[key]
    save({ ...state, images }, 'Back to the original image.')
  }
  const doExport = async () => {
    const text = JSON.stringify(await exportOwnerState(state))
    setExported(text)
    try {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
      a.download = 'sindibad-owner-config.json'
      a.click()
      setMessage('Configuration exported. If no file was saved, copy it from the box below.')
    } catch {
      setMessage('Copy the configuration from the box below.')
    }
  }
  const doPublish = async () => {
    try {
      const zip = await publishBundle(state, published)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(zip)
      a.download = 'sindibad-images.zip'
      a.click()
      setMessage('Downloaded sindibad-images.zip. Unzip it and upload everything inside to the folder public/assets/owner/ in the GitHub repo (Add file → Upload files). The site updates for everyone after that.')
    } catch {
      setMessage('Could not build the download in this browser. Try Chrome on a computer.')
    }
  }
  const doImport = async (file?: File) => {
    if (!file) return
    try {
      await save(importOwnerState(await file.text(), state), 'Configuration imported.')
    } catch (e) {
      setMessage((e as Error).message || 'That file could not be read.')
    }
  }

  const slots = plate
    ? [
        { key: foodKey(dish), label: `${dishInfo?.name ?? dish} — food`, hint: 'The food that travels from the grill: the meat only, without the skewer, as a transparent PNG.', original: first?.[1].pieces[0]?.src ?? '' },
        { key: baseKey(dish), label: 'Dish base', hint: 'The plate with rice and sides, without the arriving food.', original: plate.base },
        { key: referenceKey(dish), label: 'Complete dish reference', hint: 'The finished photo, used here to line the food up. It is not shown on the site.', original: plate.reference },
      ]
    : []

  return (
    <div className="owner">
      <header className="owner__bar">
        <div>
          <h1>Owner image editor</h1>
          <p className="owner__badge">Saved in this browser only — not published</p>
        </div>
        <a className="owner__back" href="#">Back to the site</a>
      </header>
      <p className="owner__intro">
        1. Pick a dish, press “Replace image” and choose your photo (the food alone as a transparent PNG for the grill, the plate photo for the dish). 2. Line it up with the sliders while watching the preview. 3. Tick “Show these edits on the site in this browser” to check it on the real page. 4. Press “Download for the website” and upload the files inside the ZIP to public/assets/owner/ on GitHub — then everyone sees your images. Your photos are used exactly as you upload them, never re-processed.
      </p>
      <nav className="owner__tabs" aria-label="Dish">
        {dishes.map((d) => (
          <button key={d.id} type="button" aria-pressed={d.id === dish} onClick={() => setDish(d.id)}>{d.name}</button>
        ))}
      </nav>
      <div className="owner__layout">
        <div className="owner__slots">
          {slots.map((slot) => {
            const adj = state.adjust[slot.key] ?? noAdjust
            const replaced = !!urls[slot.key]
            const live = !replaced && !!published.images[slot.key]
            return (
              <section key={slot.key} className="owner__slot" aria-labelledby={`slot-${slot.key}`}>
                <div className="owner__slot-head">
                  <img className="owner__thumb" src={allUrls[slot.key] ?? slot.original} alt="" loading="lazy" decoding="async" />
                  <div>
                    <h2 id={`slot-${slot.key}`}>{slot.label}</h2>
                    <p>{slot.hint}</p>
                    <p className="owner__status">{replaced ? 'New image — not published yet' : live ? 'Your published image' : 'Original image'}</p>
                  </div>
                </div>
                <div className="owner__actions">
                  <label className="owner__button">
                    Replace image
                    <input id={`file-${slot.key}`} type="file" accept="image/*" onChange={(e) => replace(slot.key, e.target.files?.[0])} />
                  </label>
                  <button type="button" className="owner__button owner__button--quiet" disabled={!replaced} onClick={() => useOriginal(slot.key)}>Use original</button>
                </div>
                {SLIDERS.map((s) => (
                  <label key={s.prop} className="owner__slider">
                    <span>{s.label}</span>
                    <input id={`${slot.key}-${s.prop}`} type="range" min={s.min} max={s.max} step={s.step} value={adj[s.prop]}
                      onChange={(e) => setAdjust(slot.key, s.prop, Number(e.target.value))} />
                    <output>{Math.round(adj[s.prop] * s.scale * 10) / 10}{s.unit}</output>
                  </label>
                ))}
                <button type="button" className="owner__button owner__button--quiet" onClick={() => resetAdjust(slot.key)}>Reset position</button>
              </section>
            )
          })}
        </div>
        <aside className="owner__preview" aria-label="Preview">
          <h2>Preview</h2>
          {plate && (
            <div className="owner__plate" style={{ aspectRatio: `${plate.aspect}` }}>
              <img src={allUrls[baseKey(dish)] ?? plate.base} alt="" style={{ transform: adjustTransform(state.adjust[baseKey(dish)]) }} />
              <div className="owner__landed">
                {moversFor(dish).map(([id, mover]) =>
                  scenePieces(model, mover).map((p, i) => (
                    <div key={`${id}-${i}`} className="plate-card__piece" style={landedStyle(mover, p)}>
                      <img src={p.src} alt="" draggable={false} style={{ transform: adjustTransform(state.adjust[foodKey(dish)]) }} />
                    </div>
                  )),
                )}
              </div>
              <img className="owner__reference" src={urls[referenceKey(dish)] ?? plate.reference} alt=""
                style={{ opacity: compare, transform: adjustTransform(state.adjust[referenceKey(dish)]) }} />
            </div>
          )}
          <label className="owner__slider">
            <span>Compare with complete dish</span>
            <input id="compare" type="range" min={0} max={1} step={0.01} value={compare} onChange={(e) => setCompare(Number(e.target.value))} />
            <output>{Math.round(compare * 100)}%</output>
          </label>
          {first && (
            <>
              <h3>On the grill</h3>
              <div className="owner__grill">
                {moversFor(dish).map(([id, mover]) => (
                  <div key={id} className="owner__mover" style={{ aspectRatio: `${1 / mover.canvasAspect}`, transform: `rotate(${grillLayout.items[id]?.axis ?? 0}deg)` }}>
                    {mover.metal && <img className="food__metal" src={mover.metal} alt="" />}
                    {scenePieces(model, mover).map((p, i) => (
                      <div key={i} className="food__piece" style={pieceStyle(p)}>
                        <img src={p.src} alt="" draggable={false} style={{ transform: adjustTransform(state.adjust[foodKey(dish)]) }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
      <footer className="owner__footer">
        <label className="owner__toggle">
          <input id="active" type="checkbox" checked={state.active} onChange={(e) => save({ ...state, active: e.target.checked })} />
          Show these edits on the site in this browser
        </label>
        <div className="owner__actions">
          <button type="button" className="owner__button" onClick={doPublish}>Download for the website</button>
          <button type="button" className="owner__button owner__button--quiet" onClick={doExport}>Export configuration</button>
          <label className="owner__button owner__button--quiet">
            Import configuration
            <input id="import" type="file" accept="application/json,.json" onChange={(e) => doImport(e.target.files?.[0])} />
          </label>
          <button type="button" className="owner__button owner__button--quiet" onClick={() => save({ ...emptyOwnerState(), active: false }, 'All edits cleared.')}>Clear all edits</button>
        </div>
        {message && <p className="owner__message" role="status">{message}</p>}
        {exported && <textarea id="exported" className="owner__export" readOnly value={exported} rows={4} aria-label="Exported configuration" />}
      </footer>
    </div>
  )
}
