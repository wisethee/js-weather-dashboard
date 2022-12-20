const searchInputElement = $("#search-input");
const searchButtonElement = $("#search-button");
const clearHistoryElement = $("#clear-history");

const historyElement = $("#history");

// Build history elements
const buildHistoryElements = (searchHistory) => {
  const historyListElement = $("<div>");
  historyListElement.attr("id", "history-list");
  searchHistory.forEach((element) => {
    const { name } = element;
    const historyButton = $("<button>");
    historyButton.addClass("history-button");
    historyButton.text(name);
    historyListElement.append(historyButton);
  });

  historyElement.append(historyListElement);
};

// If exists return searchHistory object from localStorage
const getSearchHistory = () => {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (!searchHistory) {
    return;
  }
  return searchHistory;
};

// Add item to localStorage
const setSearchHistory = (searchHistory) => {
  return localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
};

const clearSearchHistory = () => {
  return localStorage.clear();
};

// Store city in localStorage
const storeCity = (...props) => {
  const [city] = props;
  const { name } = city;

  let searchHistory = [];

  if (!localStorage.getItem("searchHistory")) {
    searchHistory.push(...props);
    setSearchHistory(searchHistory);
  } else {
    searchHistory = getSearchHistory();

    const cityExistsInSearchHistory = searchHistory.find(
      (city) => city.name === name
    );

    if (cityExistsInSearchHistory) {
      return;
    }

    searchHistory = [...searchHistory, ...props];
    setSearchHistory(searchHistory);
  }
};

const displayHistory = () => {
  const searchHistory = getSearchHistory();
  if (searchHistory) {
    buildHistoryElements(searchHistory);
  }
};

const updateHistory = () => {
  const searchHistory = getSearchHistory();

  historyElement.empty();
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
const searchButtonClickHandler = (event) => {
  event.preventDefault();

  const city = searchInputElement.val();
  if (!city) return;
  getCity(city);
  searchInputElement.val("");
};

const clearHistoryHandler = (event) => {
  event.preventDefault();
  clearSearchHistory();
  historyElement.empty();
};

searchButtonElement.on("click", searchButtonClickHandler);
clearHistoryElement.on("click", clearHistoryHandler);

const initDOM = () => {
  displayHistory();
};

initDOM();
