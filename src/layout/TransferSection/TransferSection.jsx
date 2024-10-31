import { useState, useEffect } from 'react'
import TransferCard from '../../components/Cards/Transfer/TransferCard'

import './transfer-section.scss'

function TransferSection({ costs, people }) {
  const [transfers, setTransfers] = useState([])

  useEffect(() => {
    calculateTransfers()
  }, [costs])

  const calculateTransfers = () => {
    let debts = {}
    
    // Инициализация долгов
    people.forEach(person1 => {
      debts[person1.name] = {}
      people.forEach(person2 => {
        if (person1.id !== person2.id) {
          debts[person1.name][person2.name] = 0
        }
      })
    })

    // Расчет долгов для каждого расхода
    costs.forEach(cost => {
      if (cost.paidBy.length && cost.splitBetween.length) {
        const amountPerPerson = cost.amount / cost.splitBetween.length
        const payer = cost.paidBy[0].name

        cost.splitBetween.forEach(person => {
          if (person.name !== payer) {
            debts[person.name][payer] += amountPerPerson
          }
        })
      }
    })

    // Оптимизация долгов (взаимозачет)
    people.forEach(person1 => {
      people.forEach(person2 => {
        if (person1.id !== person2.id) {
          if (debts[person1.name][person2.name] > 0 && debts[person2.name][person1.name] > 0) {
            const diff = Math.abs(debts[person1.name][person2.name] - debts[person2.name][person1.name])
            if (debts[person1.name][person2.name] > debts[person2.name][person1.name]) {
              debts[person1.name][person2.name] = diff
              debts[person2.name][person1.name] = 0
            } else {
              debts[person2.name][person1.name] = diff
              debts[person1.name][person2.name] = 0
            }
          }
        }
      })
    })

    // Преобразование долгов в переводы
    const transfers = []
    Object.keys(debts).forEach(from => {
      Object.keys(debts[from]).forEach(to => {
        if (debts[from][to] > 0) {
          transfers.push({
            from,
            to,
            amount: Math.round(debts[from][to] * 100) / 100
          })
        }
      })
    })

    setTransfers(transfers)
  }

  return (
    <div className="transfer-section">
      {/* <h2 className='margin--bottom'>Переводы</h2> */}
      <div className="transfer-section__cards">
        <TransferCard transfers={transfers} />
      </div>
    </div>
  )
}

export default TransferSection 