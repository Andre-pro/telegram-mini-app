const SPREADSHEET_ID = '1NdOcwBOZ0jIrPI2le4liVn2K67S-BzDaZhLfBA0WDe4'; // Ваш ID таблицы
const API_KEY = 'AIzaSyAXf9YwZpl_geOUfPAWKbIFdNMAKCxM8LA'; // Ваш API ключ
const RANGE = 'Sheet1!A1:D'; // Диапазон данных
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuokaz58CYIZUjoWueO7KdzN8d6w-PwM-yeXqD1xos6o0rJ0PB1Aj8H_qqJN_lneP2/exec'; // Ваш Google Apps Script URL

// Функция для загрузки данных из Google Sheets
async function fetchData() {
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

// Логика для страницы index.html
if (document.querySelector('#rating-table')) {
  async function renderTable(data) {
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

  document.getElementById('refresh-button')?.addEventListener('click', init);
}

// Логика для страницы add-game.html
if (document.querySelector('#add-team1')) {
  let selectedTeam = null;
  let team1Players = [];
  let team2Players = [];

  const addTeam1Button = document.getElementById('add-team1');
  const addTeam2Button = document.getElementById('add-team2');
  const modal = document.getElementById('player-select-modal');
  const playersList = document.getElementById('players-list');
  const closeModal = document.querySelector('.close');
  const submitScoreButton = document.getElementById('submit-score-button');
  const scoreModal = document.getElementById('score-modal');
  const closeScoreModal = scoreModal.querySelector('.close');
  const submitResult = document.getElementById('submit-result');

  // Открытие модального окна для выбора игроков
  addTeam1Button.addEventListener('click', () => {
    if (team1Players.length < 2) {
      selectedTeam = 1;
      openModal();
    } else {
      alert('В команде 1 уже 2 игрока');
    }
  });

  addTeam2Button.addEventListener('click', () => {
    if (team2Players.length < 2) {
      selectedTeam = 2;
      openModal();
    } else {
      alert('В команде 2 уже 2 игрока');
    }
  });

  // Закрытие модального окна
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Открытие модального окна
  function openModal() {
    modal.style.display = 'flex';
    renderPlayersList();
  }

  // Рендер списка игроков в модальном окне
  async function renderPlayersList() {
    const data = await fetchData();
    playersList.innerHTML = data.map((row, index) => `
      <div class="player-item" data-id="${index}">
        <img src="${row[3]}" alt="${row[1]}">
        <span>${row[1]}</span>
      </div>
    `).join('');

    // Добавляем обработчики для выбора игрока
    document.querySelectorAll('.player-item').forEach(item => {
      item.addEventListener('click', () => selectPlayer(item.dataset.id, data));
    });
  }

  // Выбор игрока
  function selectPlayer(playerId, data) {
    const player = data[playerId];
    if (selectedTeam === 1) {
      team1Players.push(player);
      renderSelectedPlayers('team1-players', team1Players);
    } else if (selectedTeam === 2) {
      team2Players.push(player);
      renderSelectedPlayers('team2-players', team2Players);
    }
    modal.style.display = 'none';
  }

  // Рендер выбранных игроков
  function renderSelectedPlayers(containerId, players) {
    const container = document.getElementById(containerId);
    container.innerHTML = players.map((player, index) => `
      <div class="player-item">
        <img src="${player[3]}" alt="${player[1]}">
        <span>${player[1]}</span>
        <span class="remove-player" onclick="removePlayer(${index}, '${containerId}')">Удалить</span>
      </div>
    `).join('');
  }

  // Удаление игрока
  window.removePlayer = function (index, containerId) {
    if (containerId === 'team1-players') {
      team1Players.splice(index, 1);
      renderSelectedPlayers('team1-players', team1Players);
    } else if (containerId === 'team2-players') {
      team2Players.splice(index, 1);
      renderSelectedPlayers('team2-players', team2Players);
    }
  };

  // Открытие модального окна для внесения счета
  submitScoreButton.addEventListener('click', () => {
    if (team1Players.length === 2 && team2Players.length === 2) {
      scoreModal.style.display = 'flex';
    } else {
      alert('Выберите по 2 игрока в каждой команде');
    }
  });

  // Закрытие модального окна для внесения счета
  closeScoreModal.addEventListener('click', () => {
    scoreModal.style.display = 'none';
  });

  // Подтверждение результата
  submitResult.addEventListener('click', async () => {
    const score = document.getElementById('score').value;
    const winner = document.querySelector('input[name="winner"]:checked');

    if (!score || !winner) {
      alert('Заполните счет и выберите победителя');
      return;
    }

    // Формируем данные для отправки
    const data = {
      player1Team1: team1Players[0][1], // Имя первого игрока команды 1
      player2Team1: team1Players[1][1], // Имя второго игрока команды 1
      player1Team2: team2Players[0][1], // Имя первого игрока команды 2
      player2Team2: team2Players[1][1], // Имя второго игрока команды 2
      score: score, // Счет
      winner: winner.value === 'team1' ? 'Команда 1' : 'Команда 2' // Победитель
    };

    // Отправляем данные в Google Apps Script
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Результат успешно отправлен!');
        scoreModal.style.display = 'none';
      } else {
        alert('Ошибка при отправке данных');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при отправке данных');
    }
  });
}
