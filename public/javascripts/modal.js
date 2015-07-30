var modal = (function(){
	var method = {};

	// Center the modal in the viewport
	method.center = function () {
		var top, left;
		var modal = $('#modal');

		top = Math.max($(window).height() - modal.outerHeight(), 0) / 2;
		left = Math.max($(window).width() - modal.outerWidth(), 0) / 2;
		modal.css({
			top:top + $(window).scrollTop(), 
			left:left + $(window).scrollLeft()
		});
	};

	// Open the modal
	method.open = function () {
		method.center();
		$(window).bind('resize', method.center);
		$('#overlay').show();
		$('#modal').show();
	};

	// Close the modal
	method.close = function () {
		$('#modal').hide();
		$('#overlay').hide();
		$(window).unbind('resize');
	};

	return method;
}());

$(document).ready(function(){
	$('#create-modal').on('click', function (e) {
		e.preventDefault();
		modal.open();
	});

	$('#form-add-event').on('submit', function (e) {
		e.preventDefault();
		addEvent(e);
		this.reset();
		modal.close();
	});

	$('#close').on('click', function (e) {
		e.preventDefault();
		document.getElementById('form-add-event').reset();
		modal.close();
	});

	$('#btn-cancel').on('click', function () {
		document.getElementById('form-add-event').reset();
		modal.close();
	});
});