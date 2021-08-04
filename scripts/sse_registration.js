(function($) {

  const properties = [
    'year',
    'firstnameofchild',
    'lastnameofchild',
    'schoolgradeofchild',
    'emailofchild',
    'phonenumberofchild',
    'fathersfirstname',
    'fatherslastname',
    'fathersemail',
    'fathersphone',
    'mothersfirstname',
    'motherslastname',
    'mothersemail',
    'mothersphone',
    'expectations',
    'interesting',
    'notinteresting',
    'change',
    'centercommunication',
    'bhajans',
    'covid19comments',
    'inperson',
    'instrument',
  ];

  $(function() {
    let searchResults = [];
    $('#searchForm').validator().on('submit', function(e) {
      if (e.isDefaultPrevented()) {
        return;
      }
      e.preventDefault();
      var $this = $(this);
      $.get('https://slides.ssbcsj.org/sssbcsj_api/sse', $this.serialize(),
          function(responses) {
            searchResults = [];
            if (responses === false) {
              alert(
                  'Looks like we were not able to complete the search. Please let the web master know');
              return false;
            } else if (responses.length === 0) {
              alert(
                  'We found no children matching this search string. Please try again or you might want to try a new registration.');
              return;
            }
            searchResults = responses;
            var html = [];
            for (var i = 0, len = responses.length; i < len; ++i) {
              var response = responses[i];
              html.push('<tr><td ');
              html.push('index=\'');
              html.push(i);
              html.push('\'><a href = \'#\'>');
              html.push(response[properties.indexOf('firstnameofchild')]);
              html.push('&nbsp;');
              html.push(response[properties.indexOf('lastnameofchild')]);
              html.push('</a></td></tr>');
            }
            $('#searchContent').hide();
            $('#searchResults').
                find('table').
                empty().
                html(html.join('')).
                end().
                show();
          }, 'json');
    });

    $('#newRegistration').on('click', function(e) {
      $('#searchContent').hide();
      $('#registrationForm').find(':input').each(function() {
        $(this).val('');
      }).end().show();
      $('select.form-control').trigger('change');
    });

    $('#searchResults').on('click', 'table tr td', function(e) {
      var $this = $(this);
      var index = parseInt($.trim($this.attr('index')), 10);
      if (!isNaN(index) && index >= 0 && index < searchResults.length) {
        const result = searchResults[index];
        const propertiesToMatch = [
          'fathersfirstname',
          'fatherslastname',
          'mothersfirstname',
          'motherslastname'];
        const indicesToMatch = propertiesToMatch.map(
            p => properties.indexOf(p));
        const siblings = searchResults.filter(sr => {
          const nonMatchingProperty = indicesToMatch.find(
              i => result[i] !== sr[i]);
          if (!isNaN(nonMatchingProperty)) {
            return false;
          } else {
            return true;
          }
        });

        var $form = $('#registrationForm');

        properties.forEach((property, index) => {
          $form.find('[name=\'' + property + '\']').
              val(result[index]);
        });

        //Next copy the children's properties
        var propertiesToCopy = [
          'firstnameofchild',
          'lastnameofchild',
          'schoolgradeofchild',
          'emailofchild',
          'phonenumberofchild',
        ];

        const indicesToCopy = propertiesToCopy.map(
            p => properties.indexOf(p));

        for (var i = 1, len = Math.min(siblings.length, 3); i <=
        len; ++i) {
          $.each(indicesToCopy, function(index, propertyIndex) {
            const value = siblings && i <= siblings.length ?
                siblings[i - 1][propertyIndex] :
                '';
            $form.find('[name=\'' + propertiesToCopy[index] + i + '\']').
                val(value);
          });
          const spreadsheetRange = siblings && i <= siblings.length ?
              siblings[i - 1][0] :
              '';
          $form.find('[name=\'rangeofchild' + i + '\']').
              val(spreadsheetRange);
        }

        $('select.form-control').trigger('change');

        $('#searchResults').hide();

        $form.find('[name=centercommunication]').
            val(result[properties.indexOf('centercommunication')]);
        $form.find('[name=bhajans]').
            val(result[properties.indexOf('bhajans')]);
        $form.find('[name=inperson]').
            val(result[properties.indexOf('inperson')]);
        $form.find('[name=instrument]').
            val(result[properties.indexOf('instrument')]);
        $form.find('[name=covid19comments]').
            val(result[properties.indexOf('covid19comments')]);
        $form.show();
      }
    });

    $('#registrationForm').validator().on('submit', function(e) {
      if (e.isDefaultPrevented()) {
        return;
      }

      e.preventDefault();
      var $this = $(this);

      //Next copy the children's properties
      var propertiesOfTheChildFromTheForm = [
        'firstnameofchild',
        'lastnameofchild',
        'ssegroupofchild',
        'schoolgradeofchild',
        'allergiesofchild',
      ];

      const indicesOfThePropertiesOfTheChildFromTheForm = propertiesOfTheChildFromTheForm.map(
          p => properties.indexOf(p));

      const rowsToSubmit = [];
      for (var i = 1; i <= 3; ++i) {
        const row = properties.map(p => {
          return $this.find('[name=\'' + p + '\']').val();
        });
        const firstName = $this.find('[name=\'firstnameofchild' + i + '\']').
            val();
        const lastName = $this.find('[name=\'lastnameofchild' + i + '\']').
            val();
        if (firstName && lastName) {
          propertiesOfTheChildFromTheForm.forEach((property, index) => {
            const value = $this.find('[name=\'' + property + i + '\']').
                val();
            row[indicesOfThePropertiesOfTheChildFromTheForm[index]] = value;
          });
          row[0] = $this.find('[name=\'rangeofchild' + i + '\']').val();
          rowsToSubmit.push(row);
        }
      }

      $.ajax('https://slides.ssbcsj.org/sssbcsj_api/sse', {
        data: JSON.stringify(rowsToSubmit),
        contentType: 'application/json',
        type: 'POST',
        success:
            (response) => {
              if (response !== true) {
                alert(
                    'Your information could not be saved. Please contact the web master.');
              } else {
                alert('Your information was successfully saved.');
              }
              $('#registrationForm, #searchResults').hide();
              $('#searchContent').show();
              return false;
            },
      });
    });

    $(document).ajaxStart(function() {
      window.scrollTo(0, 0);
      $('#indicator').show();
    });
    $(document).ajaxStop(function() {
      $('#indicator').hide();
    });

    $('select.form-control').change(function() {
      var $this = $(this);
      if (/nursery/i.exec($this.val())) {
        $this.next('.warning').show();
      } else {
        $this.next('.warning').hide();
      }
    });

    $('select.form-control').trigger('change');
  });
})(jQuery);
