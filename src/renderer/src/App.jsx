import { useEffect, useState } from 'react'
import company_logo from './assets/Мастер пол.png'

function App() {
  const [partners, setPartners] = useState([]);

  // useEffect(() => {
  //   (async (data = "test") => await window.api.foo(data))()
  // }, [])

  useEffect(() => {
    (async () => {
      const response = await window.api.getPartners();
      setPartners(response);
    })()
  }, [])

  return (
    <>
      <div className="page-heading">
        <img className="logo" src={company_logo} />
        <h1>Партнеры</h1>
      </div>
      <ul className='partners-list'>
        {partners.map((partner) => {
          return <li className="partner-card" key={partner.id}>
            <div>
              <p className="partner-card-heading">{partner.org_type} | {partner.partner_name}</p>
              <div>
                <p>Директор: {partner.director_ceo}</p>
                <p>+7 {partner.phone}</p>
                <p>Рейтинг: {partner.rating}</p>
              </div>
            </div>
            <div className="partner-card-heading-sale">
              {partner.discount_percent}%
            </div>
          </li>
        })}
      </ul>
    </>
  )
}

export default App

