import { useEffect, useState } from 'react'
import company_logo from './assets/Мастер пол.png'
import { Link } from 'react-router';
import { useLocation } from 'react-router';

function UpdatePartner() {
  useEffect(() => {
    (async () => {
      document.title = 'Обновление данных партнера';
    })()
  }, []);
  const location = useLocation();
  const [partner, setPartner] = useState(location.state.partner);


  async function submitHandler(e) {
    e.preventDefault()
    const updatedPartner = {
      id: partner.id,
      org_type: e.target.org_type.value,
      partner_name: e.target.partner_name.value,
      director_ceo: e.target.director_ceo.value || null,
      email: e.target.email.value || null,
      phone: e.target.phone.value || null,
      address: e.target.address.value || null,
      inn: e.target.inn.value || null,
      rating: e.target.rating.value !== '' ? +e.target.rating.value : null,
    }
    const success = await window.api.updatePartner(updatedPartner);
    if (success) {
      setPartner(updatedPartner);
      document.querySelector('form').reset();
    };
  }

  return (
    <>
      <div className="page-heading">
        <img className="logo" src={company_logo} />
        <h1>Обновление данных партнера</h1>

        <Link className="button-right" to={'/'}>
          <button>
            Назад
          </button>
        </Link>
      </div>
      <form onSubmit={(e) => submitHandler(e)}>
        <label htmlFor="org_type">Тип организации:</label>
        <select id="org_type" required defaultValue={partner.org_type} >
          <option value="ЗАО">ЗАО</option>
          <option value="ОАО">ОАО</option>
          <option value="ПАО">ПАО</option>
          <option value="ООО">ООО</option>
        </select>

        <label htmlFor="partner_name">Наименование организации:</label>
        <input id="partner_name" type="text" required defaultValue={partner.partner_name} />

        <label htmlFor="director_ceo">ФИО директора:</label>
        <input id="director_ceo" type="text" defaultValue={partner.director_ceo} />

        <label htmlFor="email">Email:</label>
        <input id="email" type="email" defaultValue={partner.email} />

        <label htmlFor="phone">Телефон:</label>
        <input id="phone" type="text" defaultValue={partner.phone} />

        <label htmlFor="address">Адрес:</label>
        <input id="address" type="text" defaultValue={partner.address} />

        <label htmlFor="inn">ИНН:</label>
        <input id="inn" type="text" defaultValue={partner.inn} />

        <label htmlFor="rating">Рейтинг:</label>
        <input id="rating" type="number" step='1' min='0' max='100' defaultValue={partner.rating} />

        <button className='form-button' type="submit">Обновить данные партнера</button>
      </form>
    </>
  )
}

export default UpdatePartner;

