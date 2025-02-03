import { ArrowRight } from 'lucide-react';
import PersonButton from '../../Button/PersonButton';
import Spinner from '../../Spinner/Spinner';

import './transfer-card.scss';

function TransferCard({ transfers, isLoading }) {
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
         <div className="transfer-card__header">
            <h3>Необходимые переводы</h3>
            {isLoading && <Spinner />}
         </div>
         
         <div className="transfer-card__transfers">
            {transfers.map((transfer, index) => (
               <div key={index} className="transfer-card__item">
                  <div className="transfer-card__people">
                     <span className="transfer-card__person">
                        {transfer.from.name}
                     </span>
                     <ArrowRight size={20} />
                     <span className="transfer-card__person">
                        {transfer.to.name}
                     </span>
                  </div>
                  <h4 className="">{formatAmount(transfer.amount)}</h4>
               </div>
            ))}
         </div>
      </div>
   );
}

export default TransferCard;
