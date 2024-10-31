import { useState } from 'react'
import { Plus, User, Users } from 'lucide-react'

// Import components
import ActionButton from '../../components/Button/ActionButton'
import AddPositionModal from '../../components/Modal/AddPositionModal'
import IconButton from '../../components/Button/IconButton'
import CostCard from '../../components/Cards/Cost/CostCard'
import PersonButton from '../../components/Button/PersonButton'

// Import styles
import './cost-section.scss'

function CostSection({
   people,
   costs,
   paymentMode,
   singlePayer,
   onAddCost,
   onUpdateCost,
   onDeleteCost,
   onPaymentModeChange,
   onSinglePayerSelect
}) {
   const [isModalOpen, setIsModalOpen] = useState(false)

   const handleAddPosition = (position) => {
      onAddCost({
         ...position,
         id: Date.now(),
         paidBy: paymentMode === 'single' && singlePayer ? [singlePayer] : [],
         splitBetween: []
      })
   }

   return (
      <div className="cost-section">
         {/* <h2 className='margin--bottom'>Расходы</h2> */}
         <div className="payment-mode flex-center flex-center__column">
            <ActionButton
               icon={<Plus />}
               onClick={() => setIsModalOpen(true)}
            >
               Добавить расход
            </ActionButton>
            
            <div className="payment-mode__selector">
               <h3>Режим оплаты</h3>
               <div className="payment-mode__icons">
                  <IconButton
                     icon={<User />}
                     onClick={() => onPaymentModeChange('single')}
                     className={`payment-mode__icon ${paymentMode === 'single' ? 'button--icon-active' : ''}`}
                     title="Единый плательщик"
                  />
                  <IconButton
                     icon={<Users />}
                     onClick={() => onPaymentModeChange('manual')}
                     className={`payment-mode__icon ${paymentMode === 'manual' ? 'button--icon-active' : ''}`}
                     title="Множество плательщиков"
                  />
               </div>
               <span className="payment-mode__label">
                  {paymentMode === 'single' ? 'Единый плательщик' : 'Множество плательщиков'}
               </span>
            </div>

            {paymentMode === 'single' && (
               <div className="payment-mode__single-payer">
                  <h3>Выберите плательщика</h3>
                  <div className="payment-mode__people">
                     {people.map(person => (
                        <PersonButton
                           key={person.id}
                           onClick={() => onSinglePayerSelect(person)}
                           className={singlePayer?.id === person.id ? 'button__person--active' : ''}
                        >
                           {person.name}
                        </PersonButton>
                     ))}
                  </div>
               </div>
            )}
         </div>

         <div className="cost-section__cards">
            {costs.map(cost => (
               <CostCard
                  key={cost.id}
                  id={cost.id}
                  title={cost.title}
                  amount={cost.amount}
                  paidBy={cost.paidBy}
                  splitBetween={cost.splitBetween}
                  people={people}
                  paymentMode={paymentMode}
                  onDelete={() => onDeleteCost(cost.id)}
                  onUpdate={(updatedCost) => onUpdateCost(cost.id, updatedCost)}
               />
            ))}
         </div>

         <AddPositionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddPosition}
            title="Добавить расход"
         />
      </div>
   )
}

export default CostSection
