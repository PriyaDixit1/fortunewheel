const participants = [
  { name: 'Col GUNJAN MALHOTRA', color: '#785289' },
  { name: 'DR DEEPA MALIK', color: '#B47EDE' },
  { name: 'MRS SARGAM KAUSHAL', color: '#D7BFDC' },
  { name: 'MRS NAMITA VATS', color: '#B200ED' },
  { name: 'MR X HERE', color: '#9966CB' }
];

// Create sectors with numbers instead of names
function createSectors() {
  return participants.map((participant, index) => ({
    color: participant.color,
    label: (index + 1).toString(),  // Convert to string for display
    name: participant.name,         // Keep name for reference
    index: index                    // Keep track of the original index
  }));
}

let sectors = createSectors();

// Create the judge name elements in a circle around the wheel
function createJudgeNameCircle() {
  // Remove any existing judge names
  const existingNames = document.querySelectorAll('.judge-name');
  existingNames.forEach(element => element.remove());

  // Add judge names in a circle
  const wheelContainer = document.getElementById('wheelOfFortune');

  participants.forEach((participant, index) => {
    const totalParticipants = participants.length;
    const angle = (index * (360 / totalParticipants) + (180 / totalParticipants)) * (Math.PI / 180);

    const nameElement = document.createElement('div');
    nameElement.className = 'judge-name';
    // Set the data-index to match the sector label (index + 1)
    nameElement.setAttribute('data-index', (index + 1).toString());
    nameElement.textContent = participant.name;
    nameElement.style.color = participant.color;

    // Position around the wheel in a circle
    // Use a larger radius than the wheel to place names outside
    const radius = 320; // Adjust this value as needed
    const left = Math.cos(angle) * radius + 300; // 300 is half the wheel width
    const top = Math.sin(angle) * radius + 300; // 300 is half the wheel height

    nameElement.style.position = 'absolute';
    nameElement.style.left = `${left}px`;
    nameElement.style.top = `${top}px`;
    nameElement.style.transform = 'translate(-50%, -50%)';
    nameElement.style.fontWeight = 'bold';
    nameElement.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.7)';
    nameElement.style.padding = '10px';
    nameElement.style.borderRadius = '5px';
    nameElement.style.background = 'rgba(255, 255, 255, 0.7)';

    wheelContainer.appendChild(nameElement);
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
let isSpinning = false; // Flag to track if wheel is currently spinning

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

  // Highlight the current judge name
  highlightCurrentJudge(getIndex());
}

function highlightCurrentJudge(index) {
  // Remove highlight from all judge names
  document.querySelectorAll('.judge-name').forEach(el => {
    el.style.background = 'rgba(255, 255, 255, 0.7)';
    el.style.color = '#000';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.zIndex = '1';
  });

  // Highlight the current judge using the sector's label as the data-index
  const currentJudgeElement = document.querySelector(`.judge-name[data-index="${sectors[index].label}"]`);
  if (currentJudgeElement) {
    currentJudgeElement.style.background = sectors[index].color;
    currentJudgeElement.style.color = '#fff';
    currentJudgeElement.style.transform = 'translate(-50%, -50%) scale(1.2)';
    currentJudgeElement.style.zIndex = '10';
  }
}

function frame() {
  if (!angVel) return;
  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) {
    angVel = 0; // Bring to stop
    isSpinning = false;
    displayWinner(); // Show the winner when wheel stops
  }
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}

function displayWinner() {
  const winningIndex = getIndex();
  const winner = sectors[winningIndex];

//  const winnerDisplay = document.getElementById('winnerDisplay');
//  winnerDisplay.textContent = `Your Judge is: ${winner.name}`;
//  winnerDisplay.style.backgroundColor = winner.color;
//  winnerDisplay.style.color = '#fff';
//  winnerDisplay.style.display = 'block';

  // Update spin button to "Spin Again"
  spinEl.textContent = '';
}

function resetWheel() {
  // Reset the wheel position but keep all judges
  ang = 0;

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
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  // Add CSS for judge names
  const style = document.createElement('style');
  style.textContent = `
    .judge-name {
      position: absolute;
      transition: all 0.3s ease;
      font-size: 14px;
      white-space: nowrap;
    }

    #wheelOfFortune {
      position: relative;
    }
  `;
  document.head.appendChild(style);

  // Add judge names in a circle
  createJudgeNameCircle();

  // Draw the initial wheel
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine

  spinEl.addEventListener('click', () => {
    if (!isSpinning) {
      // Reset winner display when spinning again
      document.getElementById('winnerDisplay').style.display = 'none';

      // Reset judge name highlighting
      document.querySelectorAll('.judge-name').forEach(el => {
        el.style.background = 'rgba(255, 255, 255, 0.7)';
        el.style.color = '#000';
        el.style.transform = 'translate(-50%, -50%)';
      });

      // Set spinning flag to true
      isSpinning = true;

      // Set a random velocity for the spin
      angVel = rand(0.25, 0.45);
    }
  });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);
