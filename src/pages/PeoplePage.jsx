import PeopleSection from '../layout/PeopleSection/PeopleSection'
import { useApp } from '../context/AppContext'

function PeoplePage() {
  const { people, addPerson, removePerson } = useApp()

  return (
    <PeopleSection 
      people={people}
      onAddPerson={addPerson}
      onRemovePerson={removePerson}
    />
  )
}

export default PeoplePage 