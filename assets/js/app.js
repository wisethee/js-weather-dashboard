const searchInput = $("#search-input");
const searchButton = $("#search-button");

const history = $("#history");

// Store city in localStorage
const storeCity = (...props) => {
  const [city] = props;
  const { name } = city;

  let searchHistory = [];

  if (!localStorage.getItem("searchHistory")) {
    searchHistory.push(...props);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  } else {
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    const cityExistsInSearchHistory = searchHistory.find(
      (city) => city.name === name
    );

    if (cityExistsInSearchHistory) {
      return;
    }

    searchHistory = [...searchHistory, ...props];
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }
};

const buildHistoryElements = (searchHistory) => {
  const historyList = $("<ul>");
  historyList.attr("id", "history-list");
  searchHistory.forEach((element) => {
    const { name } = element;
    const historyListElement = $("<li>");
    historyListElement.text(name);
    historyList.append(historyListElement);
  });

  history.append(historyList);
};

const displayHistory = () => {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));

  if (!searchHistory) {
    return;
  }

  buildHistoryElements(searchHistory);
};

const updateHistory = () => {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  const historyList = $("#history-list");

  if (!historyList) {
    return;
  }

  history.empty();
  buildHistoryElements(searchHistory);
};

// get city location, latitude and longitude and store dta in localStorage
const getCity = (city) => {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=9e044849e25b035edaacc2d88bca02e1`;
  const method = "GET";

  $.ajax({ url, method }).then((response) => {
    const [city] = response;
    const { name, lat, lon } = city;
    storeCity({ name, lat, lon });
    updateHistory();
  });
};

// handle search button
const clickHandler = (event) => {
  event.preventDefault();

  const city = searchInput.val();
  if (!city) return;
  getCity(city);
  searchInput.val("");
};

searchButton.on("click", clickHandler);

const initDOM = () => {
  displayHistory();
};

initDOM();
