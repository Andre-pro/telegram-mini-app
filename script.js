const SPREADSHEET_ID = '1NdOcwBOZ0jIrPI2le4liVn2K67S-BzDaZhLfBA0WDe4'; // Ваш ID таблицы
const API_KEY = 'AIzaSyAXf9YwZpl_geOUfPAWKbIFdNMAKCxM8LA'; // Ваш API ключ
const RANGE = 'Sheet1!A1:D'; // Диапазон данных для рейтинга
const GAMES_RANGE = 'Игры!A1:G'; // Диапазон данных для игр

// Элементы DOM
const addGameButton = document.getElementById('add-game-button');
const addGameForm = document.getElementById('add-game-form');
const gameForm = document.getElementById('game-form');
const cancelButton = document.getElementById('cancel-button');
const teamAPlayer1 = document.getElementById('team-a-player1');
const teamAPlayer2 = document.getElementById('team-a-player2');
const teamBPlayer1 = document.getElementById('team-b-player1');
const teamBPlayer2 = document.getElementById('team-b-player2');

// Показать форму добавления игры
addGameButton.addEventListener('click', () => {
  addGameForm.style.display = 'block';
});

// Скрыть форму добавления игры
cancelButton.addEventListener('click', () => {
  addGameForm.style.display = 'none';
});

// Заполнение выпадающих списков игроками
async function populatePlayerDropdowns() {
  const players = await fetchPlayers();
  players.forEach(player => {
    const option = document.createElement('option');
    option.value = player[0]; // ID игрока
    option.textContent = player[1]; // Имя игрока
    teamAPlayer1.appendChild(option.cloneNode(true));
    teamAPlayer2.appendChild(option.cloneNode(true));
    teamBPlayer1.appendChild(option.cloneNode(true));
    teamBPlayer2.appendChild(option.cloneNode(true));
  });
}

// Получение списка игроков
async function fetchPlayers() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке данных');
    }
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Ошибка:', error);
    return [];
  }
}

// Генерация ID игры на основе текущей даты
function generateGameId() {
  const now = new Date();
  return now.toISOString().slice(0, 10).replace(/-/g, ''); // Формат: ГГГГММДД
}

// Отправка данных игры
gameForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(gameForm);
  const gameData = {
    id: generateGameId(),
    teamAPlayer1: formData.get('team-a-player1'),
    teamAPlayer2: formData.get('team-a-player2'),
    teamBPlayer1: formData.get('team-b-player1'),
    teamBPlayer2: formData.get('team-b-player2'),
    resultA: formData.get('result-a'),
    resultB: formData.get('result-b'),
  };

  try {
    await saveGameData(gameData);
    alert('Игра успешно добавлена!');
    gameForm.reset();
    addGameForm.style.display = 'none';
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось добавить игру. Попробуйте ещё раз.');
  }
});

// Сохранение данных игры в Google Таблицу
async function saveGameData(gameData) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${GAMES_RANGE}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [
        [
          gameData.id,
          gameData.teamAPlayer1,
          gameData.teamAPlayer2,
          gameData.teamBPlayer1,
          gameData.teamBPlayer2,
          gameData.resultA,
          gameData.resultB,
        ],
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Ошибка при сохранении данных');
  }
}

// Инициализация
async function init() {
  await populatePlayerDropdowns();
  const data = await fetchData();
  renderTable(data);
}

init();

document.getElementById('refresh-button').addEventListener('click', init);
