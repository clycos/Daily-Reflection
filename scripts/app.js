let reflectionArray;
let reminderArray;
const reflectionFile = './data/reflectionse.json';
const reminderFile = './data/reminders.json';
let next = document.getElementById('next');
let previous = document.getElementById('previous');
let current = document.getElementById('current');
let currentDate = new Date();
let dateToProcess;
let displayDate;
let age;
let deferredPrompt;
let monthNames = [
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(() => console.log('Service Worker registered!'));
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Stop Chrome from automatically showing the prompt
  e.preventDefault();
  deferredPrompt = e;

  // Show your custom install button
  const installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
      });
    });
  }
});

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
  let rawFile = new XMLHttpRequest();
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
  let birthDate = new Date(dateString);
  age = currentDate.getFullYear() - birthDate.getFullYear();
  let m = currentDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function reflectionOutput(inputArray, d) {
  dayToProcess(d);
  let out = '<hr />';

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

    // Determine theme-based icon before building the string
    let stoicIcon = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'images/stoic-dark-theme.png'
      : 'images/stoic-light-theme.png';

    let dharmaIcon = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'images/dharma-wheel-dark-theme.png'
      : 'images/dharma-wheel-light-theme.png';

    let taoistIcon = 'images/yin-yang.png';

    let leadershipIcon = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'images/leadership-dark-theme.png'
      : 'images/leadership-light-theme.png';

    out += `<h3 class="text-primary text-uppercase">`;
    if (i === 0) {
      out += `<img src="${stoicIcon}" alt="Stoic Icon" style="height: 1em; vertical-align: middle; margin-right: 0.4em;">`;
    } else if (i === 1) {
      out += `<img src="${dharmaIcon}" alt="Dharma Icon" style="height: 1em; vertical-align: middle; margin-right: 0.4em;">`;
    } else if (i === 2) {
      out += `<img src="${taoistIcon}" alt="Taoist Icon" style="height: 1em; vertical-align: middle; margin-right: 0.4em;">`;
    } else if (i === 3) {
      out += `<img src="${leadershipIcon}" alt="Leadership Icon" style="height: 1em; vertical-align: middle; margin-right: 0.4em;">`;
    }
    out += `${topicObj.topic}</h3>`;

    // Ensure quotes exist for the topic
    if (Array.isArray(topicObj.quotes) && topicObj.quotes.length > 0) {
      for (let quote of topicObj.quotes) {
        if (!quote || !quote.quote?.trim()) continue; // Skip empty quotes
        out += `
  <blockquote class="blockquote">
    <p>${quote.author || quote.source ? `<q>${quote.quote}</q>` : quote.quote}</p>
    ${
      quote.author || quote.source
        ? `<footer class="blockquote-footer text-left">
            ${quote.author ? `<span>${quote.author}${quote.source ? ',' : ''}</span>` : ''}
            ${quote.source ? `<cite>${quote.source}</cite>` : ''}
          </footer>`
        : ''
    }
  </blockquote>`;
      }
    }

    out += `</div>`;

    // Display Notes if available
    if (topicObj.notes && topicObj.notes.trim()) {
      out += `<div id="notes"><h5><u>Reflection</u></h5>${topicObj.notes}</div>`;
    }

    // Display Additional Thoughts if available
    if (topicObj.thoughts && topicObj.thoughts.trim()) {
      out += `<div id="thoughts"><h6 class="text-info"><u>Additional Thoughts</u></h6><p>${topicObj.thoughts}</p></div>`;
    }
  }

  document.getElementById('reflection_quotes').innerHTML = out;
}

function getDayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0); // Jan 0 = Dec 31 of previous year
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const oneDay = 1000 * 60 * 60 * 24;
  console.log(Math.floor((current - start) / oneDay));
  return Math.floor((current - start) / oneDay);
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
