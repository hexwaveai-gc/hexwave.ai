'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import UpgradePlanModal from '@/app/components/common/planModal/UpgradePlanModal'

interface UpgradePlanContextType {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
}

const UpgradePlanContext = createContext<UpgradePlanContextType | undefined>(undefined)

export function UpgradePlanProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const toggleModal = () => setIsOpen(prev => !prev)

  return (
    <UpgradePlanContext.Provider value={{ isOpen, openModal, closeModal, toggleModal }}>
      {children}
      <UpgradePlanModal open={isOpen} onOpenChange={setIsOpen} />
    </UpgradePlanContext.Provider>
  )
}

export function useUpgradePlan() {
  const context = useContext(UpgradePlanContext)
  if (context === undefined) {
    throw new Error('useUpgradePlan must be used within an UpgradePlanProvider')
  }
  return context
}
