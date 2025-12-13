// components/types.ts
export type PanelType = "about" | "projects" | "experience" | "message" | "stack" | "achievements"

export interface PanelState {
    active: boolean
    position: { x: number; y: number }
    minimized: boolean
    zIndex: number
    pinned: boolean
}

export interface PanelDimensions {
    width: number
    height: number
}
