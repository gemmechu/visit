
function selectCalDay(dayTableID) {
  $('div.schedule:not(' + dayTableID + ')').slideUp();
  $(dayTableID).slideDown();

  $('.sched_btn').toggleClass('selected', false);
  $('.sched_btn').toggleClass('unselected', true);

  $(dayTableID + '_btn').toggleClass('selected', true);
  $(dayTableID + '_btn').toggleClass('unselected', false);
}

function showAllCalDays() {
  $('div.schedule').slideDown();

  $('.sched_btn').toggleClass('selected', false);
  $('.sched_btn').toggleClass('unselected', true);

  $('#all_days_btn').toggleClass('selected', true);
  $('#all_days_btn').toggleClass('unselected', false);
}

function toggleCalDay(dayTableId) {
  // Update the state of the selector buttons before sliding the clicked day.
  // This just makes the UI more uniform than doing it afterwards.
  $('.sched_btn').toggleClass('selected', false);
  $('.sched_btn').toggleClass('unselected', true);

  // Since we're about to change what's visible,
  // we need to consider the specified day to have flipped visibility.
  var visibleDays = $('div.schedule').filter(function(idx, elt) {
    return $(elt).is(':visible') == ('#' + elt.id != dayTableId)
  });
  if (visibleDays.length === 4) {
    $('#all_days_btn').toggleClass('selected', true);
    $('#all_days_btn').toggleClass('unselected', false);
  } else if (visibleDays.length == 1) {
    var button = $('#' + visibleDays[0].id + '_btn');
    button.toggleClass('selected', true);
    button.toggleClass('unselected', false);
  }

  $(dayTableId).slideToggle();
}

function setEmail(obj, user, domain) {
  var full_address = user + '@' + domain;
  obj.text(full_address);
  obj.attr('href', 'mailto:' + full_address);
}

function toggleSubEvents(listId) {
  var list = $(listId);
  var arrow = $(listId + "_arrow span.arrow_dir");
  if (list.is(':visible')) {
    list.slideUp();
    arrow.html("Show");
  } else {
    list.slideDown();
    arrow.html("Hide");
  }
}

// This function is called from the html so it needs to be visible, but we want
// to precompute some of the jQuery selectors, so we construct it as a closure
// at page load time in initialize().
var setSlideshow;

function initialize() {
  // Hide sub-events on page load.
  // This way if JS is broken or off they are still visible.
  $('div.sub_events').hide();

  // Run selectors once on page load for performance
  var wind = $(window);
  var nav_bar = $('#nav_bar');
  var nav_bar_top = nav_bar.offset().top;

  // Register a scroll handler that will keep the nav bar locked to top of the screen
  var _updateNavBarPlacement = function() {
    nav_bar.toggleClass('sticky', nav_bar_top < wind.scrollTop());
  }

  wind.scroll(_updateNavBarPlacement);
  // Run the handler once on page load incase the page is not at the top (from refresh).
  _updateNavBarPlacement();

  // Make the nav bar click-to-open.
  var nav_bar_cells = $('#nav_bar_table td div.nav_bar_cell');
  $('#nav_bar_table').removeClass('js-off');
  nav_bar_cells.click(function() {
    nav_bar_cells.not($(this)).toggleClass('show', false);
    $(this).toggleClass('show');
  });

  // If the user clicks anywhere outside the nav bar, collapse the nav bar,
  // that's focusing somewhere else!
  $(document).click(function(e) {
    if (nav_bar.has($(e.target)).length === 0) {
      nav_bar_cells.removeClass('show');
    }
  });

  var slideChangeDelay = 6000;
  var slideshowFadeSpeed = 500;
  var slideshowList = $('#slideshow_list > li');
  var slideshowSelectors = $('#slideshow_selector_div').children();
  var currentDisplayIdx = 0;
  // Count how many slide advances have been queued up so we can ignore them
  // unless the queue is empty.
  var queuedSlideAdvances = 0;

  var _setSlideshowToIndex = function(index) {
    if (index == currentDisplayIdx) return;

    var prevIndex = currentDisplayIdx;
    currentDisplayIdx = index;

    var newDisplay = $(slideshowList[index]);
    var oldDisplay = $(slideshowList[prevIndex]);

    newDisplay.css('z-index', 2);
    oldDisplay.css('z-index', 1);
    $(slideshowSelectors[index]).toggleClass('selected', true);
    $(slideshowSelectors[prevIndex]).toggleClass('selected', false);

    newDisplay.fadeTo(slideshowFadeSpeed, 1, function() {
      // This guard pretects against the user rapidly switching between slide
      // images. Without this guard, that could cause both to vanish. This
      // guarantees that at least one will remain visible.
      if (currentDisplayIdx != prevIndex) {
        oldDisplay.fadeTo(0, 0);
      }
    });

    // Queue up a new slide advance.
    queuedSlideAdvances++;
    setTimeout(_advanceSlideshow, slideChangeDelay);
  }

  var _advanceSlideshow = function() {
    // We're trying to advance, so remove the number of queued advances and
    // only actually advance if there are no more queued (executing an advance
    // will queue a new one).
    queuedSlideAdvances--;
    if (queuedSlideAdvances < 1) {
      _setSlideshowToIndex((currentDisplayIdx + 1) % slideshowList.length);
    }
  }

  setSlideshow = function(selector) {
    _setSlideshowToIndex(slideshowSelectors.index(selector));
  }

  if (slideshowList.length > 0) {
    queuedSlideAdvances = 1;
    setTimeout(_advanceSlideshow, slideChangeDelay);
  }
}
