const participants = [
  { name: 'MRS SONI SINGH', color: '#785289' },
  { name: 'MRS UMADEVI VINOD', color: '#B47EDE' },
  { name: 'MAJ GEN V SEKHON', color: '#D7BFDC' },
  { name: 'MRS AKHILA MUTHANNA', color: '#B200ED' },
  { name: 'MRS PRIYADARSHNI NAIR', color: '#9966CB' }
];

// Create a copy of participants that we'll modify as names are selected
let availableParticipants = [...participants];
let selectedParticipants = [];

// Create sectors with numbers instead of names
function createSectors() {
  return availableParticipants.map((participant, index) => ({
    color: participant.color,
    label: (index + 1).toString(),  // Convert to string for display
    name: participant.name,         // Keep name for reference
    index: index                    // Keep track of the original index
  }));
}

let sectors = createSectors();

// Populate the names list
function populateNamesList() {
  const namesList = document.getElementById('namesList');

  // Clear existing items
  namesList.innerHTML = '';

  // Add each participant to the list
  availableParticipants.forEach((participant, index) => {
    const listItem = document.createElement('li');

    // Create number badge
    const numberBadge = document.createElement('span');
    numberBadge.className = 'number-badge';
    numberBadge.style.backgroundColor = participant.color;
    numberBadge.textContent = index + 1;

    // Create name span
    const nameSpan = document.createElement('span');
    nameSpan.textContent = participant.name;

    // Append elements to list item
    listItem.appendChild(numberBadge);
    listItem.appendChild(nameSpan);
    listItem.style.borderLeftColor = participant.color;

    namesList.appendChild(listItem);
  });
}

// Function to populate the selected participants list
function populateSelectedList() {
  const namesList = document.getElementById('namesList');
  const selectedList = document.getElementById('selectedList');

  if (!selectedList) {
    // Create the selected list if it doesn't exist
    const selectedContainer = document.createElement('div');
    selectedContainer.id = 'selectedListContainer';
    selectedContainer.innerHTML = `
      <h2>SELECTED JUDGES</h2>
      <ul id="selectedList" class="names-list"></ul>
    `;
    namesList.parentNode.appendChild(selectedContainer);
  }

  const selectedListElement = document.getElementById('selectedList');
  selectedListElement.innerHTML = '';

  // Add each selected participant to the list
  selectedParticipants.forEach((participant, index) => {
    const listItem = document.createElement('li');

    // Create number badge
    const numberBadge = document.createElement('span');
    numberBadge.className = 'number-badge';
    numberBadge.style.backgroundColor = participant.color;
    numberBadge.textContent = index + 1;

    // Create name span
    const nameSpan = document.createElement('span');
    nameSpan.textContent = participant.name;

    // Append elements to list item
    listItem.appendChild(numberBadge);
    listItem.appendChild(nameSpan);
    listItem.style.borderLeftColor = participant.color;

    selectedListElement.appendChild(listItem);
  });
}

const rand = (m, M) => Math.random() * (M - m) + m;
let tot = sectors.length;
const spinEl = document.querySelector('#spin');
const ctx = document.querySelector('#wheel').getContext('2d');
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
let arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT (number instead of name)
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif'; // Larger font for numbers
  ctx.fillText(sector.label, rad - 30, 10);
  ctx.restore();
}

function rotate() {
  if (sectors.length === 0) return;

  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  spinEl.style.background = sector.color;
}

function frame() {
  if (!angVel) return;
  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) {
    angVel = 0; // Bring to stop
    if (sectors.length > 0) {
      displayWinner(); // Show the winner when wheel stops
    }
  }
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function displayWinner() {
  const winningIndex = getIndex();
  const winner = sectors[winningIndex];

  const winnerDisplay = document.getElementById('winnerDisplay');
  winnerDisplay.textContent = `Your Judge is : ${winner.name}`;
  winnerDisplay.style.backgroundColor = winner.color;
  winnerDisplay.style.color = '#fff';
  winnerDisplay.style.display = 'block';

  // Move the selected participant from available to selected
  const selectedParticipant = availableParticipants.splice(winningIndex, 1)[0];
  selectedParticipants.push(selectedParticipant);

  // Update sectors and redraw the wheel
  updateWheel();
}

function updateWheel() {
  // Update sectors with the remaining participants
  sectors = createSectors();
  tot = sectors.length;
  arc = TAU / (tot || 1); // Avoid division by zero

  // Clear the canvas
  ctx.clearRect(0, 0, dia, dia);

  // Redraw the wheel with remaining participants
  if (sectors.length > 0) {
    sectors.forEach(drawSector);
    rotate();
  } else {
    // Show reset message if no participants left
    const winnerDisplay = document.getElementById('winnerDisplay');
    winnerDisplay.textContent = "All judges have been selected!";
    winnerDisplay.style.backgroundColor = "#333";
    winnerDisplay.style.display = 'block';

    // Change spin button text to indicate reset
    spinEl.textContent = "RESET";
  }

  // Update the names list
  populateNamesList();
  populateSelectedList();
}

function resetWheel() {
  // Reset available and selected participants
  availableParticipants = [...participants];
  selectedParticipants = [];

  // Recreate sectors
  sectors = createSectors();
  tot = sectors.length;
  arc = TAU / tot;

  // Clear the canvas
  ctx.clearRect(0, 0, dia, dia);

  // Redraw the wheel
  sectors.forEach(drawSector);
  rotate();

  // Reset the winner display
  const winnerDisplay = document.getElementById('winnerDisplay');
  winnerDisplay.style.display = 'none';

  // Reset spin button
  spinEl.textContent = '';

  // Update the names list
  populateNamesList();

  // Clear the selected list
  const selectedListContainer = document.getElementById('selectedListContainer');
  if (selectedListContainer) {
    selectedListContainer.remove();
  }
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  // Add CSS for selected list
  const style = document.createElement('style');
  style.textContent = `
    #selectedListContainer {
      margin-top: 20px;
      background-color: rgba(255, 255, 255, 0.85);
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    #selectedListContainer h2 {
      text-align: center;
      margin-bottom: 15px;
      color: #333;
    }
  `;
  document.head.appendChild(style);

  populateNamesList(); // Add the names list
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine

  spinEl.addEventListener('click', () => {
    if (!angVel) {
      // If all participants have been selected, reset the wheel
      if (sectors.length === 0) {
        resetWheel();
      } else {
        // Reset winner display when spinning again
        document.getElementById('winnerDisplay').style.display = 'none';

        // Reset list highlighting
        const listItems = document.querySelectorAll('#namesList li');
        listItems.forEach(item => {
          item.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
          item.style.color = '#000';
        });

        angVel = rand(0.25, 0.45);
      }
    }
  });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);
