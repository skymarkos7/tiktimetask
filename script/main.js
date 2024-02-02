// let isTabFocused = true;

// function handleVisibilityChange() {
//   isTabFocused = !document.hidden;

//   if (isTabFocused) {
//     alert("A aba está focada");
//     // Execute as ações necessárias quando a aba estiver focada
//   } else {
//     // alert("A aba não está focada");
//     // Execute as ações necessárias quando a aba não estiver focada
//   }
// }

// document.addEventListener("visibilitychange", handleVisibilityChange);






const sortableTable = Sortable.create(
  document.getElementById("sortable-table").getElementsByTagName("tbody")[0],
  {
    handle: ".drag-handle",
    animation: 150,
  }
);

function handleInputKeydown(event) {
  if (event.key === "Enter") {
    adicionarItem();
    event.preventDefault();
  }
}

function adicionarItem() {
  const descricao = document.getElementById("input-descricao").value;
  if (descricao.trim() !== "") {
    const tabela = document.getElementById("table-body");

    const newRow = document.createElement("tr");
    tabela.insertBefore(newRow, tabela.firstChild);

    const dragCell = document.createElement("td");
    dragCell.innerHTML = "&#9776;";
    dragCell.className = "drag-handle";
    newRow.appendChild(dragCell);

    const acaoCell = document.createElement("td");
    const playIcon = document.createElement("i");
    playIcon.classList.add("fa", "fa-play", "play-icon");
    playIcon.onclick = function () {
      startTimer(this);
    };
    acaoCell.appendChild(playIcon);
    newRow.appendChild(acaoCell);

    const descricaoCell = document.createElement("td");
    descricaoCell.addEventListener("dblclick", function () {
      editarDescricao(this);
    });
    descricaoCell.textContent = descricao;
    newRow.appendChild(descricaoCell);

    const tempoCell = document.createElement("td");
    tempoCell.dataset.time = "00:00:00";
    tempoCell.textContent = "00:00:00";
    newRow.appendChild(tempoCell);

    document.getElementById("input-descricao").value = "";
  }
}

function startTimer(icon) {
  const row = icon.parentNode.parentNode;
  const tempoCell = row.cells[3];
  let tempo = tempoCell.dataset.time;
  let [hours, minutes, seconds] = tempo.split(":");
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  seconds = parseInt(seconds);

  const intervalId = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
      if (minutes === 60) {
        minutes = 0;
        hours++;
      }
    }
    tempo = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    tempoCell.textContent = tempo;
    tempoCell.dataset.time = tempo;
    document.title = "TikTimeTask | " + tempo; // Atualiza o título da aba com o tempo
  }, 1000);

  // Armazena o intervalId para poder parar o contador posteriormente
  row.dataset.intervalId = intervalId.toString();

  // Armazena a data e a hora de início
  row.dataset.startDate = getCurrentDate();
  row.dataset.startTime = getCurrentTime();

  // Altera o ícone para o ícone de pausa
  icon.classList.remove("fa-play");
  icon.classList.remove("play-icon");
  icon.classList.add("fa-pause", "pause-icon");
  icon.onclick = function () {
    pauseTimer(this);
  };
}

function pauseTimer(icon) {
  const row = icon.parentNode.parentNode;
  const intervalId = parseInt(row.dataset.intervalId);

  clearInterval(intervalId);

  // Armazena a hora de fim
  row.dataset.endTime = getCurrentTime();

  // Preencher o horário de fim e calcular SGP e Total
  const startTime = row.dataset.startTime;
  const endTime = row.dataset.endTime;

  const sgp = calculateSGP(startTime, endTime);
  const total = calculateTotal(startTime, endTime);

  const currentDate = getCurrentDate();
  const currentStartTime = getCurrentTime();

  const timeLogRow = document.createElement("tr");
  const timeLogBody = document.getElementById("time-log-body");
  timeLogBody.insertBefore(timeLogRow, timeLogBody.firstChild); // Adiciona a nova linha no topo

  const dateLogCell = document.createElement("td");
  dateLogCell.textContent = currentDate;
  timeLogRow.appendChild(dateLogCell);

  const descricaoLogCell = document.createElement("td");
  descricaoLogCell.textContent = row.cells[2].textContent;
  timeLogRow.appendChild(descricaoLogCell);

  const startLogCell = document.createElement("td");
  startLogCell.textContent = currentStartTime;
  timeLogRow.appendChild(startLogCell);

  const endLogCell = document.createElement("td");
  endLogCell.textContent = endTime;
  timeLogRow.appendChild(endLogCell);

  const sgpLogCell = document.createElement("td");
  if (parseFloat(sgp) <= 0.0) {
    sgpLogCell.textContent = sgp;
    sgpLogCell.setAttribute(
      "title",
      "Quantidade de tempo irrelevante para esse itém"
    );
    sgpLogCell.addEventListener("click", openModal);
  } else {
    sgpLogCell.textContent = sgp;
    sgpLogCell.setAttribute(
      "title",
      "Clique para obter a tabela de conversão - valores arredondados"
    );
    sgpLogCell.addEventListener("click", openModal);
  }
  timeLogRow.appendChild(sgpLogCell);

  const totalLogCell = document.createElement("td");
  totalLogCell.textContent = total;
  timeLogRow.appendChild(totalLogCell);

  // Altera o ícone para o ícone de play
  icon.classList.remove("fa-pause");
  icon.classList.remove("pause-icon");
  icon.classList.add("fa-play", "play-icon");
  icon.onclick = function () {
    startTimer(this);
  };
}

function padZero(num) {
  return num.toString().padStart(2, "0");
}

function editarDescricao(cell) {
  const descricao = cell.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = descricao;
  input.classList.add("edit-input");

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      cell.textContent = input.value;
      input.parentNode.removeChild(input);
    } else if (event.key === "Escape") {
      input.parentNode.removeChild(input);
    }
  });

  cell.textContent = "";
  cell.appendChild(input);
  input.focus();
}

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${day}-${month}-${year}`;
}

function getCurrentTime() {
  const date = new Date();
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  const seconds = padZero(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

function calculateSGP(startTime, endTime) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const duration = end - start;
  const sgp = duration / 3600; // converter para horas
  return sgp.toFixed(1);
}

function calculateTotal(startTime, endTime) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const duration = parseInt(end - start);
  const timeSaved = parseInt(localStorage.getItem("timeTotal"))
  const totalTime = timeSaved > 0 ? duration+timeSaved : duration;
  const timeFormatted = formatTime(totalTime);
  localStorage.setItem("timeTotal", totalTime);

  return timeFormatted;
}

function formatTime(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  const timeFormatted = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;

  return timeFormatted;
}

function parseTime(time) {
  const [hours, minutes, seconds] = time.split(":");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");
}

const darkModeButton = document.createElement("button");
darkModeButton.textContent = "Modo Escuro";
darkModeButton.onclick = toggleDarkMode;
darkModeButton.style.position = "fixed";
darkModeButton.style.top = "10px";
darkModeButton.style.right = "10px";
darkModeButton.style.zIndex = "9999";
document.body.appendChild(darkModeButton);

//-----------  MODAL ----------------
function openModal() {
  var modal = document.getElementById("myModal");
  var modalImg = document.getElementById("img01");
  var captionText = document.getElementById("caption");
  var openModalText = document.getElementById("openModalText");

  modal.style.display = "block";
  modalImg.src = document.getElementById("myImg").src;
  captionText.innerHTML = document.getElementById("myImg").alt;
  openModalText.style.display = "none";
}

function closeModal() {
  var modal = document.getElementById("myModal");
  var openModalText = document.getElementById("openModalText");

  modal.style.display = "none";
  openModalText.style.display = "inline";
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

//------------------------------

function highlightMatchingItems() {
  const tableBody = document.getElementById("table-body");
  const timeLogBody = document.getElementById("time-log-body");
  const descricaoClicada =
    event.target.parentNode.querySelector("td:nth-child(3)").textContent;

  for (let i = 0; i < timeLogBody.rows.length; i++) {
    const descricaoCell = timeLogBody.rows[i].querySelector("td:nth-child(2)");
    const descricao = descricaoCell.textContent;

    if (descricao === descricaoClicada) {
      timeLogBody.rows[i].style.backgroundColor = "gray";
    } else {
      timeLogBody.rows[i].style.backgroundColor = "";
    }
  }
}

document.addEventListener("click", function (event) {
  if (event.target.matches("#table-body td:nth-child(4)")) {
    highlightMatchingItems();
  }
});