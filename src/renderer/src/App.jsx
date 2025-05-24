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
      console.log(response);
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
          // return <li className="partner-card" key={partner.id} onClick={() => { navigate('/update', { state: { partner } }) }}>
          return <li className="partner-card" key={partner.id}>
            <div className="partner-data">
              <p className="card_heading">{partner.org_type} | {partner.partner_name}</p>
              <div className="partner-data-info">
                <p>{partner.director_ceo}</p>
                <p>{partner.phone}</p>
                <p>Рейтинг: {partner.rating}</p>
              </div>
            </div>
            <div className="partner_sale partner-data card_heading">
              {partner.discount_percent}%
            </div>
          </li>
        })}
      </ul>

      {/* <img alt="logo" className="logo" src={company_logo} />
      <h1>Hello, world!</h1> */}
    </>
  )
}

export default App

