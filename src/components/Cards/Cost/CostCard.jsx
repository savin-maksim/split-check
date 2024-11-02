import { Pencil, Trash2 } from 'lucide-react';
import PersonButton from '../../Button/PersonButton';
import IconButton from '../../Button/IconButton';
import './cost-card.scss';
import { useState } from 'react';
import EditPositionModal from '../../Modal/EditPositionModal';

function CostCard({ 
  id,
  title, 
  amount, 
  paidBy, 
  splitBetween, 
  onDelete, 
  onUpdate, 
  onCalculate,
  people,
  paymentMode
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEdit = (updatedCost) => {
    onUpdate(updatedCost)
    setIsEditModalOpen(false)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const handlePaidByClick = (person) => {
    if (paymentMode === 'manual') {
      onUpdate({
        id,
        title,
        amount,
        paidBy: [person],
        splitBetween
      });
    }
  };

  const handleSplitBetweenClick = (person) => {
    const isSelected = splitBetween.some(p => p.id === person.id);
    const newSplitBetween = isSelected
      ? splitBetween.filter(p => p.id !== person.id)
      : [...splitBetween, person];

    onUpdate({
      id,
      title,
      amount,
      paidBy,
      splitBetween: newSplitBetween
    });
    
    onCalculate?.();
  };

  return (
    <div className="cost-card">
      <div className="cost-card__header">
        <h3 className="">{title}</h3>
        <div className="cost-card__actions">
          <IconButton
            icon={<Pencil />}
            className="cost-card__action-btn"
            onClick={() => setIsEditModalOpen(true)}
          />
          <IconButton
            icon={<Trash2 />}
            className="cost-card__action-btn cost-card__action-btn--delete"
            onClick={onDelete}
          />
        </div>
      </div>

      {paymentMode === 'manual' && (
        <div className="cost-card__section">
          <p className="cost-card__label">Кто платил?</p>
          <div className="cost-card__tags">
            {people.map((person) => (
              <PersonButton 
                key={person.id} 
                className={`cost-card__tag ${paidBy.some(p => p.id === person.id) ? 'button__person--active' : ''}`}
                onClick={() => handlePaidByClick(person)}
              >
                {person.name}
              </PersonButton>
            ))}
          </div>
        </div>
      )}

      <div className="cost-card__section">
        <p className="cost-card__label">На кого разделить?</p>
        <div className="cost-card__tags">
          {people.map((person) => (
            <PersonButton 
              key={person.id} 
              className={`cost-card__tag ${splitBetween.some(p => p.id === person.id) ? 'button__person--active' : ''}`}
              onClick={() => handleSplitBetweenClick(person)}
            >
              {person.name}
            </PersonButton>
          ))}
        </div>
      </div>

      <div className="cost-card__footer">
        <h3 className="cost-card__amount">{formatAmount(amount)}</h3>
      </div>

      <EditPositionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        title="Редактировать расход"
        initialData={{
          id,
          title,
          amount,
          paidBy,
          splitBetween
        }}
      />
    </div>
  );
}

export default CostCard;
