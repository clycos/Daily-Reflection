var reflectionArray;
var reminderArray;
var reflectionFile = './data/reflectionse.json';
var reminderFile = './data/reminders.json';
var next = document.getElementById('next');
var previous = document.getElementById('previous');
var current = document.getElementById('current');
var currentDate = new Date();
var dateToProcess;
let displayDate;
var age;
var monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// add swipe event listeners
// Detect swipe gestures for mobile navigation
let touchStartX = 0;
let touchEndX = 0;

// Minimum swipe distance to register as a swipe
const minSwipeDistance = 120;

// Function to handle touch start
document.addEventListener(
  'touchstart',
  function (event) {
    touchStartX = event.touches[0].clientX;
  },
  false
);

// Function to handle touch end and determine swipe direction
document.addEventListener(
  'touchend',
  function (event) {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
  },
  false
);

function handleSwipe() {
  let swipeDistance = touchEndX - touchStartX;

  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (swipeDistance > 0) {
      // Swiped right (Previous)
      previous.click();
    } else {
      // Swiped left (Next)
      next.click();
    }
    // Scroll back to the top of the page
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // Smooth scrolling effect
    });
  }
}
// End swipe event listeners

function readFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType('application/json');
  rawFile.open('GET', file, true);
  rawFile.onload = function () {
    if (rawFile.readyState === 4 && rawFile.status === 200) {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

function dayToProcess(daysToAdd) {
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  dateToProcess = monthNames[currentDate.getMonth()] + ' ' + currentDate.getDate();
}

function getAge(dateString) {
  var birthDate = new Date(dateString);
  age = currentDate.getFullYear() - birthDate.getFullYear();
  var m = currentDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function reflectionOutput(inputArray, d) {
  dayToProcess(d);
  var out = '<hr />';

  let dayData = inputArray.find((entry) => entry.date === dateToProcess);

  // Get the day of the year for the current date
  let dayOfYear = getDayOfYear(currentDate);

  // Update the <h2> with the display date and day of the year
  document.querySelector('#display-date').innerText = `${dateToProcess} (${dayOfYear})`;

  // Loop through all topics for the given date
  for (let i = 0; i < dayData.topics.length; i++) {
    let topicObj = dayData.topics[i];

    if (!topicObj || !topicObj.topic?.trim()) continue; // Skip empty topics

    // Add extra spacing before each topic except the first one
    if (i > 0) {
      out += `<hr>`; // Adds extra horizontal rule
    }

    out += `<h3 class="text-primary text-uppercase">${topicObj.topic}</h3>`;
    out += `<div id="quotes">`;

    // Ensure quotes exist for the topic
    if (Array.isArray(topicObj.quotes) && topicObj.quotes.length > 0) {
      for (let quote of topicObj.quotes) {
        if (!quote || !quote.quote?.trim()) continue; // Skip empty quotes

        out += `
    <div class="quote-block">
      <blockquote class="blockquote">
        <p><q>${quote.quote}</q></p>
        <footer class="blockquote-footer text-left">
          ${quote.author ? `<span>${quote.author}${quote.source ? ',' : ''}</span>` : ''}
          ${quote.source ? `<cite>${quote.source}</cite>` : ''}
        </footer>
      </blockquote>
    </div>`;
      }
    } else {
      out += '<p class="text-muted">No quotes available for this topic.</p>';
    }

    out += `</div>`;

    // Display Notes if available
    if (topicObj.notes && topicObj.notes.trim()) {
      out += `<div id="notes"><h4>Notes:</h4>${topicObj.notes}</div>`;
    }

    // Display Additional Thoughts if available
    if (topicObj.thoughts && topicObj.thoughts.trim()) {
      out += `<div id="thoughts"><h4 class="text-primary">Additional Thoughts</h4>${topicObj.thoughts}<hr /></div>`;
    }
  }

  document.getElementById('reflection_quotes').innerHTML = out;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0); // Start of the year
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function reminderOutput(inputArray) {
  let remindersDiv = document.getElementById('reminders');
  let out = '<hr /><h3 class="text-danger">Reminders</h3>';
  let hasReminders = false;

  for (let i = 0; i < inputArray.length; i++) {
    if (inputArray[i].date === dateToProcess) {
      hasReminders = true;
      getAge(dateToProcess + ' ' + inputArray[i].year);
      out += `<p>${inputArray[i].reminder} (${inputArray[i].year}) - ${age}</p>`;
    }
  }

  if (hasReminders) {
    remindersDiv.style.display = 'block'; // Show reminders
    remindersDiv.innerHTML = out;
  } else {
    remindersDiv.style.display = 'none'; // Hide reminders
  }
}

current.addEventListener('click', function () {
  currentDate = new Date();
  reflectionOutput(reflectionArray, 0);
  reminderOutput(reminderArray);
});

next.addEventListener('click', function () {
  reflectionOutput(reflectionArray, 1);
  reminderOutput(reminderArray);
});

previous.addEventListener('click', function () {
  reflectionOutput(reflectionArray, -1);
  reminderOutput(reminderArray);
});

function readEncodedFile(file, callback) {
  fetch(file)
    .then((response) => response.json()) // Fetch encoded JSON
    .then((data) => {
      // Decode Base64 properly using TextDecoder
      const decodedBytes = Uint8Array.from(atob(data.encoded), (c) => c.charCodeAt(0));
      const decodedText = new TextDecoder('utf-8').decode(decodedBytes);

      callback(decodedText);
    })
    .catch((error) => console.error('Error fetching or decoding JSON:', error));
}

// Fetch and decode reflections
readEncodedFile(reflectionFile, function (text) {
  reflectionArray = JSON.parse(text);
  reflectionOutput(reflectionArray, 0);
});

// Fetch and decode reminders
readFile(reminderFile, function (text) {
  reminderArray = JSON.parse(text);
  reminderOutput(reminderArray);
});
