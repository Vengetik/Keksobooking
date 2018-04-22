'use strict';
// pin const
var MAIN_PIN_WIDTH = 65;
var MAIN_PIN_HEIGHT = 65;
var MAIN_PIN_TAIL = 18;
var PIN_HEIGHT = 70;
var PIN_WIDTH = 50;
// limit of drag field location
var DRAG_LOCATION = {
  xMin: 65,
  xMax: 1200,
  yMin: 150,
  yMax: 700
};
// offer variables
var avatar = [1, 2, 3, 4, 5, 6, 7, 8];
var renderTitle = [
  'Большая уютная квартира',
  'Маленькая неуютная квартира',
  'Огромный прекрасный дворец',
  'Маленький ужасный дворец',
  'Красивый гостевой домик',
  'Некрасивый негостеприимный домик',
  'Уютное бунгало далеко от моря',
  'Неуютное бунгало по колено в воде'
];
var types = ['palace', 'flat', 'house', 'bungalo'];
var check = ['12:00', '13:00', '14:00'];
var features = [
  'wifi',
  'dishwasher',
  'parking',
  'washer',
  'elevator',
  'conditioner'
];
var renderPhotos = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel2.jpg',
  'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];
// DOM variables
var fragment = document.createDocumentFragment();
var mapBlock = document.querySelector('.map');
var adForm = document.querySelector('.ad-form');
var mapPins = document.querySelector('.map__pins');
var mainMapPin = document.querySelector('.map__pin--main');
// Pin variables

var pinTemplate = document.querySelector('template')
    .content.querySelector('button.map__pin');

// card variables
var cardTemplate = document.querySelector('template')
    .content.querySelector('article.map__card');

// optimization func
var shuffleArray = function (someArray) {
  return someArray.sort(function () {
    return Math.random() - 0.5;
  });
};
var getRandomArrayElement = function (arr) {
  var rand = Math.floor(Math.random() * arr.length);
  return arr[rand];
};
var getRandomValue = function (max, min) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// offer block
var createOffers = function () {
  var ads = [];
  var shuffledTitile = shuffleArray(renderTitle);
  for (var i = 0; i < 8; i++) {
    ads[i] = {
      author: {
        avatar: 'img/avatars/user' + '0' + avatar[i] + '.png'
      },
      offer: {
        title: shuffledTitile[i],
        address: '',
        price: getRandomValue(1000000, 1000),
        type: getRandomArrayElement(types),
        rooms: getRandomValue(5, 1),
        guests: getRandomValue(15, 1),
        checkin: getRandomArrayElement(check),
        checkout: getRandomArrayElement(check),
        features: shuffleArray(features.slice(0, Math.floor(Math.random() * features.length) + 1)),
        description: '',
        photos: shuffleArray(renderPhotos)
      },
      location: {
        x: getRandomValue(900, 300),
        y: getRandomValue(500, 150)
      }
    };
    ads[i].offer.address = ads[i].location.x.toString() + ', ' + ads[i].location.y.toString();
  }
  return ads;
};

// create pin
var createPin = function (ad) {
  var pin = pinTemplate.cloneNode(true);
  pin.style.left = ad.location.x + (PIN_WIDTH / 2) + 'px';
  pin.style.top = ad.location.y + PIN_HEIGHT + 'px';
  pin.querySelector('img').src = ad.author.avatar;
  pin.querySelector('img').alt = ad.offer.title;
  return pin;
};
// added listener on click for pin
var setListenerToPin = function (pin, ad) {
  pin.addEventListener('click', function () {
    removeCard();
    renderCard(ad);
  });
};
// render pin on map
var offers = createOffers();
var renderPins = function (ad) {
  for (var i = 0; i < ad.length; i++) {
    var pin = createPin(ad[i]);
    setListenerToPin(pin, ad[i]);
    fragment.appendChild(pin);
  }
  mapPins.appendChild(fragment);
};

var createCard = function (offerCard) {
  var card = cardTemplate.cloneNode(true);
  var russianType;
  var featuresList = card.querySelector('.popup__features');
  var cardImgBlock = card.querySelector('.popup__photos');
  var cardImg = card.querySelector('.popup__photo');
  cardImgBlock.removeChild(cardImg);
  if (offerCard.offer.type === 'flat') {
    russianType = 'Квартира';
  } else if (offerCard.offer.type === 'bungalo') {
    russianType = 'Бунгало';
  } else if (offerCard.offer.type === 'house') {
    russianType = 'Дом';
  } else if (offerCard.offer.type === 'palace') {
    russianType = 'Дворец';
  }
  card.querySelector('.popup__title').textContent = offerCard.offer.title;
  card.querySelector('.popup__text--address').textContent = offerCard.offer.address;
  card.querySelector('.popup__text--price').textContent = offerCard.offer.price + '₽/ночь';
  card.querySelector('.popup__type').textContent = russianType;
  card.querySelector('.popup__text--capacity').textContent = offerCard.offer.rooms + 'комнаты для ' + offerCard.offer.guests + 'гостей';
  card.querySelector('.popup__text--time').textContent = 'Заезд после ' + offerCard.offer.checkin + ', выезд до ' + offerCard.offer.checkout;
  featuresList.innerHTML = '';
  for (var j = 0; j < offerCard.offer.features.length; j++) {
    var newElement = document.createElement('li');
    newElement.classList.add('popup__feature', 'popup__feature--' + offerCard.offer.features[j]);
    featuresList.appendChild(newElement);
  }
  card.querySelector('.popup__description').textContent = offerCard.offer.description;
  for (var i = 0; i < offerCard.offer.photos.length; i++) {
    var hotelImage = document.createElement('img');
    hotelImage.src = offerCard.offer.photos[i];
    hotelImage.classList.add('popup__photo');
    hotelImage.width = '45';
    hotelImage.height = '40';
    hotelImage.alt = 'Фотография жилья';
    cardImgBlock.appendChild(hotelImage);
  }
  card.querySelector('.popup__avatar').src = offerCard.author.avatar;

  return card;
};

var renderCard = function (cardOffer) {
  var card = createCard(cardOffer);
  var popupCrossElement = card.querySelector('.popup__close');
  document.addEventListener('keydown', onCardEscPress);
  popupCrossElement.addEventListener('click', onCrossClick);
  mapBlock.insertBefore(card, mapBlock.children[3]);
};

// Close card cross listener
var onCrossClick = function () {
  removeCard();
};
var onCardEscPress = function (evt) {
  if (evt.keyCode === 27) {
    removeCard();
  }
  document.removeEventListener('keydown', onCardEscPress);
};
// Close card pin listener
var removeCard = function () {
  var mapCardElement = mapBlock.querySelector('.map__card');
  if (mapCardElement) {
    mapCardElement.remove();
  }
};

// Disable form elements
var toggleForm = function (className, hide) {
  var formFields = document.getElementsByClassName(className);
  for (var i = 0; i < formFields.length; i++) {
    formFields[i].disabled = hide;
  }
};

toggleForm('ad-form__element', true);

var isMapActive = function () {
  return mapBlock.classList.contains('map--faded');
};

var fillFormAddressValue = function () {
  var x = parseInt(mainMapPin.style.left, 10) + MAIN_PIN_WIDTH / 2;
  var y = isMapActive() ? parseInt(mainMapPin.style.top, 10) + MAIN_PIN_HEIGHT / 2 : parseInt(mainMapPin.style.top, 10) + MAIN_PIN_HEIGHT + MAIN_PIN_TAIL;

  var value = x + ', ' + y;
  document.forms[1].address.value = value;
};
fillFormAddressValue();

var activatePage = function () {
  mapBlock.classList.remove('map--faded'); //  Removed map faded
  adForm.classList.remove('ad-form--disabled'); // Remove blur from form
  toggleForm('ad-form__element', false); // Activate form
  fillFormAddressValue();
};

mainMapPin.addEventListener('mouseup', function onMainPinDrop() {
  renderPins(offers);
  activatePage();
  mainMapPin.removeEventListener('mouseup', onMainPinDrop);
});

var formTypeField = adForm.elements.type;
var formPriceField = adForm.elements.price;
var formTimeIn = adForm.elements.timein;
var formTimeOut = adForm.elements.timeout;
var formRooms = adForm.elements.rooms;
var formCapacity = adForm.elements.capacity;

formTypeField.addEventListener('change', function () {
  if (formTypeField.value === 'bungalo') {
    formPriceField.setAttribute('min', 0);
    formPriceField.setAttribute('placeholder', 0);
  } else if (formTypeField.value === 'flat') {
    formPriceField.setAttribute('min', 1000);
    formPriceField.setAttribute('placeholder', 1000);
  } else if (formTypeField.value === 'house') {
    formPriceField.setAttribute('min', 5000);
    formPriceField.setAttribute('placeholder', 5000);
  } else if (formTypeField.value === 'palace') {
    formPriceField.setAttribute('min', 10000);
    formPriceField.setAttribute('placeholder', 10000);
  }
});
var onTermOfStayChange = function (field1, field2) {
  field1.addEventListener('change', function () {
    field2.value = field1.value;
  });
};
onTermOfStayChange(formTimeIn, formTimeOut);
onTermOfStayChange(formTimeOut, formTimeIn);

var onRoomOrGuestQuantityChange = function () {
  var roomNumber = parseInt(formRooms.value, 10);
  var guestNumber = parseInt(formCapacity.value, 10);
  if (roomNumber < guestNumber) {
    formCapacity.setCustomValidity('Количество комнат не соответствует числу гостей');
  } else if (roomNumber === 100 & guestNumber !== 0) {
    formCapacity.setCustomValidity('Так много комнат не для гостей');
  } else {
    formCapacity.setCustomValidity('');
  }
};
formRooms.addEventListener('change', onRoomOrGuestQuantityChange);

formCapacity.addEventListener('change', onRoomOrGuestQuantityChange);

mainMapPin.addEventListener('mousedown', function (evt) {
  evt.preventDefault();

  var starCoords = {
    x: evt.clientX,
    y: evt.clientY
  };
  var onMouseMove = function (moveEvt) {
    moveEvt.preventDefault();

    var shift = {
      x: starCoords.x - moveEvt.clientX,
      y: starCoords.y - moveEvt.clientY
    };
    var newY = mainMapPin.offsetTop - shift.y;
    var newX = mainMapPin.offsetLeft - shift.x;
    if (newY >= DRAG_LOCATION.yMin - MAIN_PIN_HEIGHT && newY <= DRAG_LOCATION.yMax - (MAIN_PIN_HEIGHT + MAIN_PIN_TAIL)
      && newX >= DRAG_LOCATION.xMin - MAIN_PIN_WIDTH && newX <= DRAG_LOCATION.xMax - MAIN_PIN_WIDTH) {
      starCoords = {
        x: moveEvt.clientX,
        y: moveEvt.clientY
      };
      mainMapPin.style.top = (mainMapPin.offsetTop - shift.y) + 'px';
      mainMapPin.style.left = (mainMapPin.offsetLeft - shift.x) + 'px';
      fillFormAddressValue();
    }
  };

  var onMouseUp = function (upEvt) {
    upEvt.preventDefault();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});
