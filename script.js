const SPREADSHEET_ID = '1NdOcwBOZ0jIrPI2le4liVn2K67S-BzDaZhLfBA0WDe4'; // Ваш ID таблицы
const API_KEY = 'AIzaSyAXf9YwZpl_geOUfPAWKbIFdNMAKCxM8LA'; // Ваш API ключ
const RANGE = 'Sheet1!A1:B'; // Диапазон данных

// Функция для получения данных из Google Таблицы
async function fetchData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке данных');
    }
    const data = await response.json();
    return data.values || []; // Если данных нет, вернем пустой массив
  } catch (error) {
    console.error('Ошибка:', error);
    return [];
  }
}

// Функция для отображения данных в таблице
function renderTable(data) {
  const tbody = document.querySelector('#rating-table tbody');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2">Данные не найдены</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(row => `
    <tr>
      <td>${row[0]}</td>
      <td>${row[1]}</td>
    </tr>
  `).join('');
}

// Основная функция
async function init() {
  const data = await fetchData();
  renderTable(data);
}

// Запуск приложения
init();

// Добавляем обработчик для кнопки обновления (если кнопка есть)
const refreshButton = document.getElementById('refresh-button');
if (refreshButton) {
  refreshButton.addEventListener('click', init);
}
