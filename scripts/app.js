/* website used as examples for this app
 https://www.w3schools.com/js/tryit.asp?filename=tryjson_http
 https://www.w3schools.com/js/tryit.asp?filename=tryjson_parse_date
 https://api.jquery.com/jquery.when/
 https://stackoverflow.com/questions/24909006/javascript-get-data-from-json-to-a-global-variable
 https://stackoverflow.com/questions/38963412/getting-next-and-previous-element-of-json-inputArrayay
 go to https://github.com/clycos/Daily-Reflection/settings/pages to see the github pages settings
 public url: https://clycos.github.io/Daily-Reflection/
 */

var reflectionArray;
var reminderArray;
var reflectionFile = './data/reflectionse.json';
var reminderFile = './data/reminders.json';
var next = document.getElementById('next');
var previous = document.getElementById('previous');
var current = document.getElementById('current');
var currentDate = new Date();
var dateToProcess;
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
  // console.log('Current Date: ' + currentDate);
  dateToProcess = monthNames[currentDate.getMonth()] + ' ' + currentDate.getDate();
  // console.log('Date To Process: ' + dateToProcess);
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

//loop through reflectionOutput and display results to page
function reflectionOutput(inputArray, d) {
  dayToProcess(d); // set current date
  var out = '<hr />'; //begin output with an HR tag

  // LOOP FOR REFLECTION OUTPUT
  for (var i = 0; i < inputArray.length; i++) {
    if (inputArray[i].date === dateToProcess) {
      // only populate today's quote
      out += '<h2>' + inputArray[i].date + '</h2>'; //Date Line
      out += '<h3 class="text-primary text-uppercase">' + inputArray[i].topic + '</h3>'; //Topic Line
      out += '<div id = "quotes">';
      for (var j = 0; j < inputArray[i].quotes.length; j++) {
        out +=
          '<div id="quote_' +
          (j + 1) +
          '">' +
          '<blockquote class="blockquote">' +
          '<p>' +
          '<q>' +
          inputArray[i].quotes[j].quote +
          '</q>' +
          '</p>' +
          '<footer class="blockquote-footer text-left">' +
          '<span>' +
          inputArray[i].quotes[j].author +
          ', </span>' +
          '<cite>' +
          inputArray[i].quotes[j].source +
          '</cite>' +
          '</footer>' +
          '</blockquote>' +
          '</div>';
      }
      out += '<hr />'; // add hard return
      out += '</div>'; // end div quotes
      out += '<div id="notes">';
      out += inputArray[i].notes; //main text of the json
      out += '</div>'; // end div notes

      // Add additional thoughts if they exist
      if (inputArray[i].thoughts && inputArray[i].thoughts.length > 0) {
        out += '<div id="thoughts">';
        out += '<h3 class="text-primary">Additional Thoughts</h3>';
        out += inputArray[i].thoughts + '<hr />';
        out += '</div>'; // end div thoughts
      } else out += '<hr />'; // add hard return

      // code to disable next and previous buttons
      //next.disabled = (i+1) >= inputArray.length;
      //next.hidden = (i + 1) >= inputArray.length;
      //previous.disabled = i <= 0;
      //previous.hidden = i <= 0;
    } //end if
  } //end for loop
  document.getElementById('reflection_quotes').innerHTML = out;
} // END reflectionOutput(inputArray)

//loop through reflectionOutput and display results to page
function reminderOutput(inputArray) {
  // LOOP FOR REMINDER OUTPUT
  document.getElementById('reminders').style.visibility = 'hidden';
  var out = '<h3 class="text-danger">Reminders</h3>';
  for (var i = 0; i < inputArray.length; i++) {
    if (inputArray[i].date === dateToProcess) {
      // only populate today's quote
      document.getElementById('reminders').style.visibility = 'visible';
      getAge(dateToProcess + ' ' + inputArray[i].year);
      out += '<p>';
      out += inputArray[i].reminder;
      out += ' (' + inputArray[i].year + ') - ' + age;
      out += '</p>'; // end div reminder
    } //end if
  } //END FOR LOOP
  document.getElementById('reminders').innerHTML = out;
} // END reflectionOutput(inputArray)

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
    .then((response) => response.json()) // Fetch JSON
    .then((data) => {
      const decodedText = atob(data.encoded); // Decode Base64
      callback(decodedText);
    })
    .catch((error) => console.error('Error fetching or decoding JSON:', error));
}

readEncodedFile(reflectionFile, function (text) {
  reflectionArray = JSON.parse(text);
  reflectionOutput(reflectionArray, 0);
});

readFile(reminderFile, function (text) {
  reminderArray = JSON.parse(text);
  reminderOutput(reminderArray);
});
