import { useEffect, useState } from 'react';
import company_logo from './assets/Мастер пол.png';
// import { Link } from 'react-router';
import { useNavigate } from 'react-router';

function App() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    (async () => {
      document.title = 'Список партнеров';
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
          return <li className="partner-card" key={partner.id} onClick={() => { navigate('/updatePartner', { state: { partner } }) }}>
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
      <button onClick={() => { navigate('/addPartner') }}>Добавить партнера</button>
    </>
  )
}

export default App

