﻿DROP TABLE IF EXISTS organization_types CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS product_types CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS partners_products CASCADE;
DROP TABLE IF EXISTS material_types CASCADE;
DROP FUNCTION IF EXISTS get_partners_with_discount();
DROP FUNCTION IF EXISTS create_partner_with_validation();
DROP FUNCTION IF EXISTS update_partner_with_validation();
DROP FUNCTION IF EXISTS delete_partner;

CREATE TABLE organization_types (
	id SMALLSERIAL PRIMARY KEY,
	type TEXT CHECK(type IN ('ЗАО', 'ОАО', 'ПАО', 'ООО'))
);

CREATE TABLE partners (
	id SERIAL PRIMARY KEY,
	org_type_id SMALLINT NOT NULL REFERENCES organization_types(id),
	name TEXT NOT NULL UNIQUE CHECK (length(name) <= 255 AND name <> ''),
	director_ceo TEXT CHECK (length(director_ceo) <= 255),
	email TEXT CHECK (length(email) <= 255),
	phone TEXT CHECK (phone ~ '^\d{3} \d{3} \d{2} \d{2}$' OR phone = ''),
	address TEXT CHECK (length(address ) <= 500),
	inn VARCHAR(12) CHECK (inn ~ '^(\d{12}|\d{10})$' OR inn = ''),
	rating SMALLINT CHECK (rating BETWEEN 0 AND 100)
);

CREATE TABLE product_types (
	id SMALLSERIAL PRIMARY KEY,
	type TEXT CHECK(length(type) <= 50),
	multiplier NUMERIC(4, 2) 
);

CREATE TABLE products (
	id SERIAL PRIMARY KEY,
	type_id SMALLINT NOT NULL REFERENCES product_types(id),
	name TEXT NOT NULL CHECK (length(name) <= 255),
	article TEXT CHECK (article ~ '^\d{7}$'),
	min_price NUMERIC(12, 2) 
);

-- Junction-таблица для связи many-to-many между партнерами и продуктами, поэтому partners_products а не partner_products
CREATE TABLE partners_products (
	id BIGSERIAL PRIMARY KEY,
	product_id INT NOT NULL REFERENCES products(id),
	partner_id INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
	product_quantity INT NOT NULL CHECK (product_quantity > 0),
	date_of_sale DATE
);

CREATE TABLE material_types (
	id SMALLSERIAL PRIMARY KEY,
	type TEXT CHECK(length(type) <= 50),
	defects_percent NUMERIC(5, 2) 
);

SET datestyle  = 'DMY';

INSERT INTO organization_types (type) VALUES ('ЗАО'), ('ОАО'), ('ПАО'), ('ООО');

INSERT INTO partners (org_type_id, name, director_ceo, email, phone, address, inn, rating) VALUES
	(1, 'База Строитель', 'Иванова Александра Ивановна', 'aleksandraivanova@ml.ru', '493 123 45 67', '652050, Кемеровская область, город Юрга, ул. Лесная, 15', '2222455179', 7),
	(4, 'Паркет 29', 'Петров Василий Петрович', 'vppetrov@vl.ru', '987 123 56 78',  '164500, Архангельская область, город Северодвинск, ул. Строителей, 18', '3333888520', 7),
	(3, 'Стройсервис', 'Соловьев Андрей Николаевич', 'ansolovev@st.ru', '812 223 32 00', '188910, Ленинградская область, город Приморск, ул. Парковая, 21', '4440391035', 7),
	(2, 'Ремонт и отделка', 'Воробьева Екатерина Валерьевна', 'ekaterina.vorobeva@ml.ru', '444 222 33 11',  '143960, Московская область, город Реутов, ул. Свободы, 51', '1111520857', 5),
	(1, 'МонтажПро', 'Степанов Степан Сергеевич', 'stepanov@stepan.ru', '912 888 33 33', '309500, Белгородская область, город Старый Оскол, ул. Рабочая, 122', '5552431140', 10);

INSERT INTO product_types (type, multiplier) VALUES
	('Ламинат', 2.35),	
	('Массивная доска', 5.15),	
	('Паркетная доска', 4.34),	
	('Пробковое покрытие', 1.5);

INSERT INTO products (type_id, name, article, min_price) VALUES
	(3, 'Паркетная доска Ясень темный однополосная 14 мм', '8758385', 4456.90),
	(3, 'Инженерная доска Дуб Французская елка однополосная 12 мм', '8858958', 7330.99),
	(1, 'Ламинат Дуб дымчато-белый 33 класс 12 мм', '7750282', 1799.33),
	(1, 'Ламинат Дуб серый 32 класс 8 мм с фаской', '7028748', 3890.41),
	(4, 'Пробковое напольное клеевое покрытие 32 класс 4 мм', '5012543', 5450.59);

INSERT INTO partners_products (product_id, partner_id, product_quantity, date_of_sale) VALUES
	(1, 1, 15500, '23-03-2023'),
	(3, 1, 12350, '18-12-2023'),
	(4, 1, 37400, '07-06-2024'),
	(2, 2, 35000, '02-12-2022'),
	(5, 2, 1250, '17-05-2023'),
	(3, 2, 1000, '07-06-2024'),
	(1, 2, 7550, '01-07-2024'),
	(1, 3, 7250, '22-01-2023'),
	(2, 3, 2500, '05-07-2024'),
	(4, 4, 59050, '20-03-2023'),
	(3, 4, 37200, '12-03-2024'),
	(5, 4, 4500, '14-05-2024'),
	(3, 5, 50000, '19-09-2023'),
	(4, 5, 670000, '10-11-2023'),
	(1, 5, 35000, '15-04-2024'),
	(2, 5, 25000, '12-06-2024');

INSERT INTO material_types (type, defects_percent) VALUES
	('Тип материала 1', 0.1),
	('Тип материала 2', 0.95),
	('Тип материала 3', 0.28),
	('Тип материала 4', 0.55),
	('Тип материала 5', 0.34);

CREATE OR REPLACE FUNCTION get_partners_with_discount()
RETURNS TABLE (
	id INT,
	org_type TEXT,
	partner_name TEXT,
	director_ceo TEXT,
	email TEXT,
	phone TEXT,
	address TEXT,
	inn VARCHAR,
	rating SMALLINT,
	total_sold BIGINT, -- только для отладки (в проде можно удалить)
	discount_percent INT
) AS $$
BEGIN
	RETURN QUERY
	SELECT 
		p.id,
		ot.type AS org_type,
		p.name AS partner_name,
		p.director_ceo,
		p.email,
		p.phone,
		p.address,
		p.inn,
		p.rating,
		SUM(pp.product_quantity) AS total_sold,
		CASE
			WHEN SUM(pp.product_quantity) >= 300000 THEN 15
			WHEN SUM(pp.product_quantity) >= 50000 THEN 10
			WHEN SUM(pp.product_quantity) >= 10000 THEN 5
			ELSE 0
		END AS discount_percent
	FROM partners AS p
	JOIN organization_types AS ot ON p.org_type_id = ot.id
	LEFT JOIN partners_products AS pp ON p.id = pp.partner_id
	GROUP BY p.id, ot.type
	ORDER BY p.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_partner_with_validation(
	p_org_type TEXT,
	p_name TEXT,
	p_director_ceo TEXT DEFAULT NULL, -- DEFAULT NULL можно не использовать
	p_email TEXT DEFAULT NULL, -- DEFAULT NULL можно не использовать
	p_phone TEXT DEFAULT NULL, -- DEFAULT NULL можно не использовать
	p_address TEXT DEFAULT NULL, -- DEFAULT NULL можно не использовать
	p_inn TEXT DEFAULT NULL, -- DEFAULT NULL можно не использовать
	p_rating INT DEFAULT NULL -- DEFAULT NULL можно не использовать
) 
RETURNS INT AS $$
DECLARE
	new_id INT;
	v_org_type_id SMALLINT;
BEGIN
	-- получение id типа организации
	SELECT id INTO v_org_type_id 
	FROM organization_types 
	WHERE type = p_org_type;

	-- валидация
	IF v_org_type_id IS NULL THEN
	-- IF p_org_type NOT IN ('ЗАО', 'ОАО', 'ПАО', 'ООО') THEN -- или такой вариант
		RAISE EXCEPTION 'Недопустимый тип организации: %. Допустимые типы: "ЗАО", "ОАО", "ПАО", "ООО"', p_org_type;
	END IF;

	IF EXISTS(SELECT 1 FROM partners WHERE name = p_name) THEN
		RAISE EXCEPTION 'Партнер с именем "%" уже существует', p_name;
	END IF;

	IF p_name IS NULL OR  p_name = ''  THEN
		RAISE EXCEPTION 'Имя партнера не может быть пустым';
	END IF;

	IF length(p_name) > 255 THEN
		RAISE EXCEPTION 'Имя партнера слишком длинное (допускается максимум 255 символов)';
	END IF;

	IF length(p_director_ceo) > 255 THEN
		RAISE EXCEPTION 'ФИО директора слишком длинное (допускается максимум 255 символов)';
	END IF;

	IF length(p_email) > 255 THEN
		RAISE EXCEPTION 'Email слишком длинный (допускается максимум 255 символов)';
	END IF;

	IF p_phone IS NOT NULL AND p_phone !~ '^\d{3} \d{3} \d{2} \d{2}$' THEN
		RAISE EXCEPTION 'Неверный формат телефона: %. Используйте формат: "XXX XXX XX XX"', p_phone;
	END IF;

	IF length(p_address) > 500 THEN
		RAISE EXCEPTION 'Адрес слишком длинный (допускается максимум 500 символов)';
	END IF;

	IF p_inn IS NOT NULL AND EXISTS(SELECT 1 FROM partners WHERE inn = p_inn) THEN
		RAISE EXCEPTION 'Партнер с ИНН % уже существует (проверьте данные)', p_inn;
	END IF;
	
	IF p_inn !~ '^(\d{10}|\d{12})$' THEN
		RAISE EXCEPTION 'Неверный формат ИНН: %. Должно быть 10 или 12 цифр (или оставьте поле пустым)', p_inn;
	END IF;

	IF p_rating < 0 OR p_rating > 100 THEN
		RAISE EXCEPTION 'Рейтинг должен быть в диапазоне от 0 до 100. Полученное значение: %', p_rating;
	END IF;

	-- вставка данных
	INSERT INTO partners (
		org_type_id, name, director_ceo, email, phone, address, inn, rating
	) VALUES (
		v_org_type_id, p_name, p_director_ceo, p_email, p_phone, p_address, p_inn, p_rating
	) 
	RETURNING id INTO new_id;
    
	RETURN new_id;

EXCEPTION
	WHEN others THEN
		RAISE EXCEPTION 'Ошибка при добавлении партнера: %.', SQLERRM; -- для отладки, в проде можно оставить сообщение без описания ошибки
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_partner_with_validation(
	p_id INT,
	p_org_type TEXT,
	p_name TEXT,
	p_director_ceo TEXT,
	p_email TEXT,
	p_phone TEXT,
	p_address TEXT,
	p_inn TEXT,
	p_rating INT
) 
RETURNS VOID AS $$
DECLARE
	v_org_type_id SMALLINT;
BEGIN
	IF NOT EXISTS(SELECT 1 FROM partners WHERE id = p_id) THEN
		RAISE EXCEPTION 'Партнер с ID % не найден', p_id;
	END IF;

	-- получение id типа организации
	SELECT id INTO v_org_type_id 
	FROM organization_types 
	WHERE type = p_org_type;

	-- валидация
	IF v_org_type_id IS NULL THEN
	-- IF p_org_type NOT IN ('ЗАО', 'ОАО', 'ПАО', 'ООО') THEN -- или такой вариант
		RAISE EXCEPTION 'Недопустимый тип организации: %. Допустимые типы: "ЗАО", "ОАО", "ПАО", "ООО"', p_org_type;
	END IF;

	IF EXISTS(SELECT 1 FROM partners WHERE name = p_name AND id <> p_id) THEN
		RAISE EXCEPTION 'Партнер с именем "%" уже существует', p_name;
	END IF;

	IF p_name IS NULL OR  p_name = ''  THEN
		RAISE EXCEPTION 'Имя партнера не может быть пустым';
	END IF;

	IF length(p_name) > 255 THEN
		RAISE EXCEPTION 'Имя партнера слишком длинное (допускается максимум 255 символов)';
	END IF;

	IF length(p_director_ceo) > 255 THEN
		RAISE EXCEPTION 'ФИО директора слишком длинное (допускается максимум 255 символов)';
	END IF;

	IF length(p_email) > 255 THEN
		RAISE EXCEPTION 'Email слишком длинный (допускается максимум 255 символов)';
	END IF;

	IF p_phone IS NOT NULL AND p_phone !~ '^\d{3} \d{3} \d{2} \d{2}$' THEN
		RAISE EXCEPTION 'Неверный формат телефона: %. Используйте формат: "XXX XXX XX XX"', p_phone;
	END IF;

	IF length(p_address) > 500 THEN
		RAISE EXCEPTION 'Адрес слишком длинный (допускается максимум 500 символов)';
	END IF;

	IF p_inn IS NOT NULL AND EXISTS(SELECT 1 FROM partners WHERE inn = p_inn AND id <> p_id) THEN
		RAISE EXCEPTION 'Партнер с ИНН % уже существует (проверьте данные)', p_inn;
	END IF;
	
	IF p_inn !~ '^(\d{10}|\d{12})$' THEN
		RAISE EXCEPTION 'Неверный формат ИНН: %. Должно быть 10 или 12 цифр (или оставьте поле пустым)', p_inn;
	END IF;

	IF p_rating < 0 OR p_rating > 100 THEN
		RAISE EXCEPTION 'Рейтинг должен быть в диапазоне от 0 до 100. Полученное значение: %', p_rating;
	END IF;

	-- обновление данных
	UPDATE partners SET
		org_type_id = v_org_type_id,
		name = p_name,
		director_ceo = p_director_ceo,
		email = p_email,
		phone = p_phone,
		address = p_address,
		inn = p_inn,
		rating = p_rating
	WHERE id = p_id;

EXCEPTION
	WHEN others THEN
		RAISE EXCEPTION 'Ошибка при обновлении данных партнера: %.', SQLERRM; -- для отладки, в проде можно оставить сообщение без описания ошибки
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_partner(p_id INT) RETURNS VOID AS $$
BEGIN
	IF NOT EXISTS(SELECT 1 FROM partners WHERE id = p_id) THEN
		RAISE EXCEPTION 'Партнера с ID % не существует', p_id;
	END IF;

	DELETE FROM partners WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
