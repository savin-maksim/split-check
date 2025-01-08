import CostSection from '../layout/CostSection/CostSection'
import { useApp } from '../context/AppContext'

function CostsPage() {
  const { 
    people,
    costs,
    paymentMode,
    singlePayer,
    addCost,
    updateCost,
    deleteCost,
    changePaymentMode,
    selectSinglePayer
  } = useApp()

  return (
    <CostSection 
      people={people}
      costs={costs}
      paymentMode={paymentMode}
      singlePayer={singlePayer}
      onAddCost={addCost}
      onUpdateCost={updateCost}
      onDeleteCost={deleteCost}
      onPaymentModeChange={changePaymentMode}
      onSinglePayerSelect={selectSinglePayer}
    />
  )
}

export default CostsPage 