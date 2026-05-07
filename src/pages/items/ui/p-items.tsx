import { useState, useCallback } from 'react'

import { EPaymentMode } from '@/entities/check'
import type { TItem } from '@/entities/check'
import { useRegisterNavAction } from '@/widgets/w-bottom-nav'
import { useCurrentCheckFromRoute } from '@/shared/lib'

import { useItemsPageHandlers } from '../lib/use-items-page-handlers'
import { ItemsContent } from './items-content'
import { ItemsEmptyNoItems } from './items-empty-no-items'
import { ItemsEmptyNoPeople } from './items-empty-no-people'
import { ItemsPageModals } from './items-page-modals'

import './p-items.scss'

export const PItems = () => {
  const { check, checkId } = useCurrentCheckFromRoute()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<TItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<TItem | null>(null)
  const [isClearAllOpen, setIsClearAllOpen] = useState(false)

  const {
    handleAddItem,
    handleEditItem,
    handleAddBulkItems,
    handleClearAll,
    handleConfirmDeleteItem,
    handleOpenClearAll,
  } = useItemsPageHandlers({
    checkId,
    editItem,
    itemToDelete,
    setAddOpen: setIsAddOpen,
    setClearAllOpen: setIsClearAllOpen,
  })

  useRegisterNavAction(useCallback(() => setIsAddOpen(true), []))

  if (!check) return null

  const { people, items, paymentMode, singlePayer } = {
    people: check.people,
    items: check.items,
    paymentMode: check.paymentMode ?? EPaymentMode.Manual,
    singlePayer: check.singlePayer,
  }

  const noPeople = people.length === 0
  const noItems = items.length === 0

  return (
    <div className="p-items">
      {noPeople ? (
        <ItemsEmptyNoPeople checkId={checkId} />
      ) : noItems ? (
        <ItemsEmptyNoItems onAddBulkItems={handleAddBulkItems} />
      ) : (
        <ItemsContent
          checkId={checkId}
          people={people}
          items={items}
          paymentMode={paymentMode}
          singlePayer={singlePayer}
          onEdit={setEditItem}
          onRequestDelete={setItemToDelete}
          onOpenClearAll={handleOpenClearAll}
          onAddBulkItems={handleAddBulkItems}
        />
      )}

      <ItemsPageModals
        isAddOpen={isAddOpen}
        setIsAddOpen={setIsAddOpen}
        editItem={editItem}
        setEditItem={setEditItem}
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        isClearAllOpen={isClearAllOpen}
        setIsClearAllOpen={setIsClearAllOpen}
        noPeople={noPeople}
        noItems={noItems}
        paymentMode={paymentMode}
        singlePayer={singlePayer}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onConfirmDeleteItem={handleConfirmDeleteItem}
        onClearAll={handleClearAll}
      />
    </div>
  )
}
