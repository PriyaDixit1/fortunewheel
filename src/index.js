const participants = [
  { name: 'MRS SONI SINGH', color: '#785289' },
  { name: 'MRS UMADEVI VINOD', color: '#B47EDE' },
  { name: 'MAJ GEN V SEKHON', color: '#D7BFDC' },
  { name: 'MRS AKHILA MUTHANNA', color: '#B200ED' },
  { name: 'MRS PRIYADARSHNI NAIR', color: '#9966CB' }
];

// Create sectors with numbers instead of names
const sectors = participants.map((participant, index) => ({
  color: participant.color,
  label: (index + 1).toString(),  // Convert to string for display
  name: participant.name,         // Keep name for reference
  index: index                    // Keep track of the original index
}));

// Populate the names list
function populateNamesList() {
  const namesList = document.getElementById('namesList');

  // Clear existing items
  namesList.innerHTML = '';

  // Add each participant to the list
  participants.forEach((participant, index) => {
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

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector('#spin');
const ctx = document.querySelector('#wheel').getContext('2d');
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

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
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  spinEl.style.background = sector.color;
}

function frame() {
  if (!angVel) return;
  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) {
    angVel = 0; // Bring to stop
    displayWinner(); // Show the winner when wheel stops
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

  // Highlight the winner in the list
  const listItems = document.querySelectorAll('#namesList li');

  // Reset all items
  listItems.forEach(item => {
    item.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    item.style.color = '#000';
  });

  // Highlight winner
  listItems[winner.index].style.backgroundColor = winner.color;
  listItems[winner.index].style.color = '#fff';
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  populateNamesList(); // Add the names list
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine

  spinEl.addEventListener('click', () => {
    if (!angVel) {
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
  });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);
