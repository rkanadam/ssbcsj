(function($) {
  $(function() {

    var daysToEvents = {};
    var daysToDates = {};
    var apiLocation = '../server/birthday_bhajan_signup.php';
    $.get(apiLocation, function(events) {
      events = events || [];
      for (var i = 0, len = events.length; i < len; ++i) {
        var event = events[i];
        var start = new Date(event.start);
        //convert to PST
        start = new Date(
            start.toLocaleString('en-US', {timeZone: 'America/Los_Angeles'}));
        var day = start.getDay();
        //If the event does not start at 5PM or 7:15 PM or 8PM then it must be a service event or something like that. Just ignore it
        if (!(start.getHours() === 17 || start.getHours() === 20 ||
            start.getHours() === 19)) {
          continue;
        }
        if (daysToEvents[day]) {
          daysToEvents[day].push(event);
          daysToDates[day].push(new Date(event.start).toLocaleString('en-US',
              {timeZone: 'America/Los_Angeles'}));
        } else {
          daysToEvents[day] = [event];
          daysToDates[day] = [
            new Date(event.start).toLocaleString('en-US',
                {timeZone: 'America/Los_Angeles'})];
        }
      }
    }, 'json');

    $('select').selectpicker();

    $('#city select').change(function() {
      $('#date, #details').hide();

      var $this = $(this);
      var val = $this.val();
      if (!val) {
        $('#date select').empty().selectpicker('refresh');
        $('#details:input').val('');
        return;
      }

      var daysOfTheWeek = $.map(val.split(',', -1), function(v) {
        return parseInt($.trim(v), 10);
      });

      var availableDates = [];
      $.each(daysOfTheWeek, function(_, dayOfTheWeek) {
        var firstDate = new Date(2021, 7, 19, 19, 0, 0, 0); // This should be the first day the bhajan starts
        var lastDate = new Date(2021, 10, 22, 19, 0, 0, 0); // This should be the last day the bhajan starts
        var d = new Date(firstDate.getTime());
        d.setDate(d.getDate() - d.getDay() + dayOfTheWeek);
        //We are trying to determine the very first day of the said week of the day when the bhajan will begin
        //So let us say the bhajan starts on a Wednesday then the first monday will be after that date
        if (d.getTime() < firstDate.getTime()) {
          d.setDate(d.getDate() + 7);
        }

        var reservedDates = daysToDates[dayOfTheWeek] || [];
        for (var i = 0; i < 14; ++i) {
          const formattedString = d.toLocaleString('en-US');
          if (reservedDates.indexOf(formattedString) === -1 && d.getTime() <=
              lastDate.getTime()) {
            availableDates.push(formattedString);
          }
          d.setDate(d.getDate() + 7);
        }
      });
      availableDates.sort((a1, a2) => {
        return new Date (a1).getTime() - new Date(a2).getTime();
      });
      var html = $(availableDates).map(function() {
        return [
          '<option value="',
          this,
          '">',
          new Date(this).toDateString(),
          '</option>'];
      }).get().join('');
      $('#date select').html('<option value = ""></option>' + html);
      $('#date select').selectpicker('refresh');
      $('#date').show();
    });

    $('#date select').change(function() {
      var $this = $(this);
      var val = $this.val();
      if (!val) {
        $('#details').hide();
        $('#details:input').val('');
        return;
      }
      $('#details').show();
    });

    $('#bhajanSignupForm').validator().on('submit', function(e) {
      if (e.isDefaultPrevented()) {
        return;
      }

      e.preventDefault();
      var $this = $(this);
      $('#city [name=\'cityName\']').
          val($('#city select option:selected').text());
      $.post(apiLocation, $this.serialize(), function(response) {
        if (response !== true) {
          alert(
              'Uh-oh we had some trouble requesting your signup. Please contact the web master.');
        } else {
          alert(
              'We have requested for your signup. You will receive a confirmation  e-mail soon! If not see Raghuram @ raghuram.kanadam@gmail.com');
        }
        window.location.reload();
      }, 'json');

    });

    $(document).ajaxStart(function() {
      window.scrollTo(0, 0);
      $('#indicator').show();
    });
    $(document).ajaxStop(function() {
      $('#indicator').hide();
    });
  });
})(jQuery);
