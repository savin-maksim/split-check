import { ArrowRight } from 'lucide-react';
import PersonButton from '../../Button/PersonButton';

import './transfer-card.scss';

function TransferCard({ transfers }) {
   const formatAmount = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
         style: 'currency',
         currency: 'RUB',
         minimumFractionDigits: 2,
         maximumFractionDigits: 2
      }).format(amount);
   };

   return (
      <div className="transfer-card">
         <h3>Необходимые переводы</h3>
         
         <div className="transfer-card__transfers">
            {transfers.map((transfer, index) => (
               <div key={index} className="transfer-card__item">
                  <div className="transfer-card__people">
                     <PersonButton className="transfer-card__person">
                        {transfer.from}
                     </PersonButton>
                     <ArrowRight size={20} />
                     <PersonButton className="transfer-card__person">
                        {transfer.to}
                     </PersonButton>
                  </div>
                  <h4 className="">{formatAmount(transfer.amount)}</h4>
               </div>
            ))}
         </div>
      </div>
   );
}

export default TransferCard;
