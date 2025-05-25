import { use, useEffect } from 'react'
import company_logo from './assets/Мастер пол.png'
// import { Link } from 'react-router';
import { useNavigate } from 'react-router';

function AddPartner() {
  useEffect(() => {
    (async () => {
      document.title = 'Добавление партнера в базу данных';
    })()
  }, [])
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault()
    const partner = {
      org_type: e.target.org_type.value,
      partner_name: e.target.partner_name.value,
      director_ceo: e.target.director_ceo.value || null,
      email: e.target.email.value || null,
      phone: e.target.phone.value || null,
      address: e.target.address.value || null,
      inn: e.target.inn.value || null,
      rating: e.target.rating.value !== '' ? +e.target.rating.value : null,
    }
    const success = await window.api.addPartner(partner);
    if (success) document.querySelector('form').reset();
  }

  return (
    <>
      <div className="page-heading">
        <img className="logo" src={company_logo} />
        <h1>Добавление партнера</h1>
        <button className="button-right" onClick={() => { navigate('/') }}>Назад</button>
      </div>
      <form onSubmit={(e) => submitHandler(e)}>
        <label htmlFor="org_type">Тип организации:</label>
        <select id="org_type" required>
          <option value="ЗАО">ЗАО</option>
          <option value="ОАО">ОАО</option>
          <option value="ПАО">ПАО</option>
          <option value="ООО">ООО</option>
        </select>

        <label htmlFor="partner_name">Наименование организации:</label>
        <input id="partner_name" type="text" required />

        <label htmlFor="director_ceo">ФИО директора:</label>
        <input id="director_ceo" type="text" />

        <label htmlFor="email">Email:</label>
        <input id="email" type="email" />

        <label htmlFor="phone">Телефон:</label>
        <input id="phone" type="text" />

        <label htmlFor="address">Адрес:</label>
        <input id="address" type="text" />

        <label htmlFor="inn">ИНН:</label>
        <input id="inn" type="text" />

        <label htmlFor="rating">Рейтинг:</label>
        <input id="rating" type="number" step='1' min='0' max='100' />

        <button className='form-button' type="submit">Добавить партнера в базу данных</button>
      </form>
    </>
  )
}

export default AddPartner;

