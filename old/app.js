window.onload = function () {
	var count = parseInt(window.localStorage.count) || 1000000;
	var PASSWORD = 'dashulya';

	var $countElement = document.querySelector('[fn-count]');
	var $decrementButton = document.querySelector('[fn-decrement]');
	var $settingsButton = document.querySelector('[fn-settings]');
	var $form = document.querySelector('[fn-form]');
	var $popup = document.querySelector('[fn-popup]');
	var $main = document.querySelector('[fn-main]');
	var $ava = document.querySelector('[fn-ava]');

	var kissTemplate = document.querySelector('[fn-kiss-template]').innerHTML;

	var formatCount = function (count) {
		return count.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, '$1,');
	};

	var showCount = function () {
		$countElement.textContent = formatCount(count);
	};

	var saveCount = function (newCount) {
		count = newCount;
		window.localStorage.count = newCount;
		showCount();
	};

	var showPopup = function () {
		$form.reset();
		$popup.style.display = '';
		$main.style.display = 'none';
	};

	var hidePopup = function () {
		$form.reset();
		$popup.style.display = 'none';
		$main.style.display = '';
	};

	var kiss = function () {
		var div = document.createElement('div');

		div.innerHTML = kissTemplate;

		var kissElement = div.firstElementChild;

		kissElement.style.top = ($ava.offsetTop + 100) + 'px';
		kissElement.style.left = ($ava.offsetLeft + 60) + 'px';

		document.body.appendChild(kissElement);

		setTimeout(function () {
			document.body.removeChild(kissElement);
		}, 1000);
	}

	$decrementButton.addEventListener('click', function () {
		saveCount(count - 1);

		kiss();
	});

	$form.addEventListener('submit', function (event) {
		event.preventDefault();

		var elements = this.elements;

		if (elements.password.value === PASSWORD) {
			var newCount = elements.exact.valueAsNumber || count - elements.decrement.valueAsNumber;

			newCount && saveCount(newCount);
		}

		hidePopup();
	});

	$settingsButton.addEventListener('click', showPopup);

	showCount();
	hidePopup();
};