const searchInputElement = $("#search-input");
const searchButtonElement = $("#search-button");
const clearHistoryElement = $("#clear-history");

const historyElement = $("#history");

const todayElement = $("#today");
const forecastElement = $("#forecast");

const todayDate = moment().format("DD/MM/YYYY");

// build history elements
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

// build today forecast elements
const buildDailyForecastElements = (props) => {
  const { name, forecast, element, showName } = props;
  const {
    dt_txt,
    main: { temp, humidity },
    wind: { speed },
    weather,
  } = forecast;

  const dailyDate = moment(dt_txt).format("DD/MM/YYYY");

  let displayTitle = "";
  let headerClass = "";

  if (!showName) {
    displayTitle = `${dailyDate}`;
    headerClass = "forecast-header-col";
  } else {
    displayTitle = `${name} (${todayDate})`;
    headerClass = "forecast-header-row";
  }

  const forecastCard = $("<div>").addClass("forecast-card");
  const forecastHeader = $("<div>").addClass(headerClass);
  forecastHeader.append($("<h5>").text(displayTitle));
  forecastHeader.append(
    $("<img>").attr(
      "src",
      `http://openweathermap.org/img/w/${weather[0].icon}.png`
    )
  );
  forecastCard.append(forecastHeader);
  forecastCard.append($("<span>").addClass("").text(`Temp: ${temp} ℃`));
  forecastCard.append($("<span>").addClass().text(`Wind: ${speed} KPH`));
  forecastCard.append($("<span>").addClass().text(`Humidity: ${humidity}%`));
  element.append(forecastCard);
};

// build forecast elements
const buildForecastElements = (props) => {
  props.forEach((day) => {
    buildDailyForecastElements({
      forecast: day,
      element: forecastElement,
      showName: false,
    });
  });
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

const resetDashboardElements = () => {
  todayElement.empty();
  forecastElement.empty();
  todayElement.removeClass("hidden");
  forecastElement.removeClass("hidden");
};

// get forecast
const getForecast = (city) => {
  const searchHistory = getSearchHistory().find((c) => c.name === city);
  const { lat, lon } = searchHistory;
  const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=9e044849e25b035edaacc2d88bca02e1&units=metric `;
  const method = "GET";
  $.ajax(url, method).then((response) => {
    const { city, list } = response;
    const dailyForecast = [];
    list.forEach((element, index) => {
      if (index % 8 === 0) dailyForecast.push(element);
    });
    resetDashboardElements();
    buildDailyForecastElements({
      name: city.name,
      forecast: list[0],
      element: todayElement,
      showName: true,
    });
    buildForecastElements(dailyForecast);
  });
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
    getForecast(name);
  });
};

// update DOM
const updateDOM = () => {};

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
