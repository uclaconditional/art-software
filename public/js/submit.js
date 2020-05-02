$(document).ready(() => {
  populateForm();

  const token = window.location.search.substring(1);
  if (token) {
    $.post('/account', {token: token}, (res) => {
      console.log(res)
      if (res.success) displayForm(res);
      else displayError(res);
    });
  } else {
    $.get('/authenticated', (res) => {
      console.log(res)
      if (res.success) displayForm(res);
      else displayError(res);
    });
  }

});

function submit() {
  $('form').hide();
  $('#uploading').show();
  let formData = new FormData($('form')[0]);
  console.log(formData)
  $.ajax({
    type: 'POST',
    url: '/upload',
    data: formData,
    processData: false,
    contentType: false,
    success: (res) => {
      console.log(res);
      $('#uploading').hide();
      $('#thankyou').show();
    }
  })
}

function displayForm(res) {
  $('#artist-email').val(res.email);
  $('#sorry').hide();
  $('#form').show();

  // look up exisiting entries
  $.post('/search', {'artist-email': res.email}, (res) => {
    console.log(res);
    if (res.length) {
      let entry = res[0]; // todo: show multiple entries?
      for (prop in entry) {
        $('#'+prop).val(entry[prop]);
      }
    }
  });
}

function displayError() {
  $('#sorry').show();
}