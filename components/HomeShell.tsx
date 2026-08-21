'use client'

import { useEffect, useState } from 'react'

import ParticleField from './ParticleField'
import SplashCursor from './SplashCursor'
import Nav, { type NavLink } from './Nav'
import Loader from './Loader'
import BPChat from './BPChat'
import { IS_SMALL, NOANIM } from '@/lib/anim'
import type { IntroContent } from '@/lib/cms/sections'
import type { MenuItemView } from '@/lib/cms/types'

type Props = {
  menu: MenuItemView[]
  settings: Record<string, unknown>
  showIntro: boolean
  introContent?: IntroContent
  children: React.ReactNode
}

const flag = (settings: Record<string, unknown>, key: string, fallback = true): boolean =>
  typeof settings[key] === 'boolean' ? (settings[key] as boolean) : fallback

/**
 * The homepage chrome, lifted straight out of the old App.jsx: the loader
 * hands over to the site, the fluid cursor and particle field mount behind it,
 * and the nav flies in. Behaviour and timings are unchanged — the only new
 * thing is that the nav links and the feature toggles come from the CMS.
 */
export default function HomeShell({ menu, settings, showIntro, children }: Props) {
  // `NOANIM` is deliberately left out of this: it reads matchMedia, which the
  // server can't, so folding it in here would make the first client render
  // disagree with the server HTML and cost a full re-render of the page. The
  // effect below drops the loader on the next tick instead — with motion off
  // there was nothing to watch anyway.
  const wantsLoader = flag(settings, 'features.loader') && showIntro

  // Two flags so the loader and the site overlap for one beat: `siteUp` mounts
  // the page underneath while the loader is still dissolving, so the logo intro
  // blooms *through* the fade instead of appearing after a blank frame.
  const [siteUp, setSiteUp] = useState(!wantsLoader)
  const [loaderGone, setLoaderGone] = useState(!wantsLoader)

  useEffect(() => {
    if (!NOANIM) return
    setSiteUp(true)
    setLoaderGone(true)
  }, [])

  // Hold the page still while the loader is up, and always begin at the top.
  useEffect(() => {
    if (loaderGone) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = prev
    }
  }, [loaderGone])

  const links: NavLink[] = menu.map((m, i) => ({ label: m.label, href: m.href, active: i === 0 }))

  return (
    <>
      {!loaderGone && <Loader onReveal={() => setSiteUp(true)} onDone={() => setLoaderGone(true)} />}
      {!siteUp ? null : (
        <>
          {flag(settings, 'features.particleField') && <ParticleField />}
          {/* Runs on desktop (mouse) AND mobile (finger drag). Phones get a
              lighter sim so trails stay smooth and easy on the battery. */}
          {flag(settings, 'features.splashCursor') && (
            <SplashCursor
              RAINBOW_MODE={false}
              COLOR="#d4a02f"
              BACK_COLOR={{ r: 0, g: 0, b: 0 }}
              SPLAT_RADIUS={IS_SMALL ? 0.3 : 0.22}
              SPLAT_FORCE={IS_SMALL ? 6200 : 5200}
              DENSITY_DISSIPATION={IS_SMALL ? 3.6 : 4.2}
              VELOCITY_DISSIPATION={2.4}
              CURL={2.4}
              SIM_RESOLUTION={IS_SMALL ? 96 : 128}
              DYE_RESOLUTION={IS_SMALL ? 512 : 1440}
              SHADING={!IS_SMALL}
            />
          )}
          <Nav links={links} />
          <main>{children}</main>
          {flag(settings, 'features.chatEnabled') && <BPChat />}
        </>
      )}
    </>
  )
}
