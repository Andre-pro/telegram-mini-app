const SPREADSHEET_ID = '1NdOcwBOZ0jIrPI2le4liVn2K67S-BzDaZhLfBA0WDe4'; // Ваш ID таблицы
const API_KEY = 'AIzaSyAXf9YwZpl_geOUfPAWKbIFdNMAKCxM8LA'; // Ваш API ключ
const RANGE = 'Sheet1!A1:D'; // Новый диапазон данных

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

function renderTable(data) {
  const tbody = document.querySelector('#rating-table tbody');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Данные не найдены</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(row => `
    <tr>
      <td>${row[0]}</td> <!-- Номер игрока -->
      <td>
        <div class="player-info">
          <img src="${row[3]}" alt="${row[1]}" class="player-photo">
          <span>${row[1]}</span>
        </div>
      </td>
      <td>${row[2]}</td> <!-- Рейтинг игрока -->
    </tr>
  `).join('');
}

async function init() {
  const data = await fetchData();
  renderTable(data);
}

init();

document.getElementById('refresh-button').addEventListener('click', init);
