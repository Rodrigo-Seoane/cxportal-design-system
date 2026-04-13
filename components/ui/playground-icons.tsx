'use client'

// Re-exports Phosphor icons through a client boundary so they can be safely
// imported in component-registry.ts (which is also imported by server pages).
export {
  AddressBookIcon,
  CalendarIcon,
  TagIcon,
  UserListIcon,
} from '@phosphor-icons/react'
