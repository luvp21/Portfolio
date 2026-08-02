import type { Transition } from "framer-motion"

// Shared "snappy" spring used for panel/dock entrance and interaction
// feedback across the app — keeps damping/stiffness consistent instead of
// each component hand-typing a slightly different value.
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
}
