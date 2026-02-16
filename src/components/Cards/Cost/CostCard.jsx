import { Pencil, Trash2, Copy } from 'lucide-react';
import PersonButton from '../../Button/PersonButton';
import IconButton from '../../Button/IconButton';
import './cost-card.scss';
import { useState } from 'react';
import EditPositionModal from '../../Modal/EditPositionModal';

function CostCard({
  id,
  title,
  amount,
  quantity,
  pricePerUnit,
  paidBy,
  splitBetween,
  onDelete,
  onUpdate,
  onDuplicate,
  onCalculate,
  people,
  paymentMode
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleEdit = (updatedCost) => {
    onUpdate({
      ...updatedCost,
      paidBy: paidBy,
      splitBetween: splitBetween
    });
    setIsEditModalOpen(false);
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0';
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
        quantity,
        pricePerUnit,
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
      quantity,
      pricePerUnit,
      paidBy,
      splitBetween: newSplitBetween
    });

    onCalculate?.();
  };

  const handleSplitSelect = (person) => {
    const updatedSplitBetween = splitBetween.includes(person)
      ? splitBetween.filter(p => p !== person)
      : [...splitBetween, person]

    onUpdate(id, {
      id,
      title,
      amount,
      quantity,
      pricePerUnit,
      paidBy,
      splitBetween: updatedSplitBetween
    })
  }

  const handlePayerSelect = (person) => {
    const updatedPaidBy = paidBy.includes(person)
      ? paidBy.filter(p => p !== person)
      : [...paidBy, person]

    onUpdate(id, {
      id,
      title,
      amount,
      quantity,
      pricePerUnit,
      paidBy: updatedPaidBy,
      splitBetween
    })
  }

  return (
    <div className="cost-card">
      <div className="cost-card__header">
        <h3 className="">{title}</h3>
        <div className="cost-card__actions">
          <IconButton
            icon={<Copy />}
            className="cost-card__action-btn"
            onClick={() => onDuplicate({
              id: Date.now(),
              title,
              amount,
              quantity,
              pricePerUnit,
              paidBy,
              splitBetween: []
            })}
            title="Дублировать"
          />
          <IconButton
            icon={<Pencil />}
            className="cost-card__action-btn"
            onClick={() => setIsEditModalOpen(true)}
            title="Редактировать"
          />
          <IconButton
            icon={<Trash2 />}
            className="cost-card__action-btn cost-card__action-btn--delete"
            onClick={onDelete}
            title="Удалить"
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
        <div className="cost-card__calculation">
          <span className="cost-card__calculation-details">
            {quantity || 1} × {formatAmount(pricePerUnit || 0)}
          </span>
          <h3 className="cost-card__amount">{formatAmount(amount)}</h3>
        </div>
      </div>

      <EditPositionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        title="Редактирование"
        initialData={{
          id,
          title,
          amount,
          quantity,
          pricePerUnit,
          paidBy,
          splitBetween
        }}
      />
    </div>
  );
}

export default CostCard;
